import { injectable, container, inject } from "tsyringe";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import _ from "lodash";
import _debug from "debug";
import type { StatsCommunitiesDto, StatsNeighborhoodsrankingDto, StatsWidgetsDto } from "../validate/stats.js";
import RepliersListings, { RplListingsSearchResponse, RplRollingPeriodName, StatsMoment } from "./repliers/listings.js";
import { RplDateFormat, RplDateFormatter, RplMonthFormat, RplStatus, RplType } from "../types/repliers.js";
import { AppConfig } from "../config.js";
import cached, { Cached } from "../lib/decorators/cached.js";
import type { DataCommunities } from "./stats/communities.js";
const debug = _debug("repliers:services:stats");
dayjs.extend(utc);
const config = container.resolve<AppConfig>("config");
interface FetchStats {
   neighborhood: string;
   monthlyChange: PeriodAvgStats;
   threeMonthChange: PeriodAvgStats;
   yoyChange: PeriodAvgStats;
}
type FetchStatsReturn = Array<FetchStats>;
interface WidgetsReturn {}
interface PeriodAvgStats {
   change: number;
   avgCurrent: number;
   avgPrevious: number;
}
@injectable()
export default class StatsService {
   constructor(private repliers: RepliersListings, @inject("data.communities")
   private data: DataCommunities) {}
   getSum<T extends string>(records: Record<string, Record<T, number>> | undefined, field: T) {
      if (!records) {
         return 0;
      }
      let sum = 0;
      for (const v of Object.values(records)) {
         sum += v[field];
      }
      return sum;
   }
   @cached("widgets", config.cache.statswidget.ttl_ms)
   async widgets(params: StatsWidgetsDto): Promise<WidgetsReturn | Cached<WidgetsReturn>> {
      const periods = {
         month: dayjs().utc().subtract(1, "month").format(RplDateFormatter) as RplDateFormat,
         threeMonths: dayjs().utc().subtract(3, "month").format(RplDateFormatter) as RplDateFormat,
         year: dayjs().utc().subtract(1, "year").format(RplDateFormatter) as RplDateFormat,
         historyMinDate: dayjs().utc().subtract(params.historyMonthsCount, "month").startOf("month").format(RplDateFormatter) as RplDateFormat
      };
      const months = _.range(0, params.historyMonthsCount).map(i => {
         return dayjs().utc().subtract(i, "month").startOf("month").format("YYYY-MM") as RplMonthFormat;
      });
      const {
         map,
         area,
         city,
         neighborhood,
         community
      } = params;
      const district = 0 < community?.length ? this.getDistrictIds(community) : params.district;
      const widgetParams = {
         map,
         class: params.class,
         area,
         city,
         neighborhood,
         district,
         listings: false,
         type: [RplType.Sale]
      };
      const statParams = {
         ...widgetParams,
         statistics: "avg-soldPrice,med-soldPrice,sum-soldPrice,avg-daysOnMarket,med-daysOnMarket",
         status: [RplStatus.U]
      };
      const [monthResult, threeMonthResult, yearResult, activeResult, newResult, soldPerMonthResult] = await Promise.all([this.repliers.search({
         ...statParams,
         minSoldDate: periods.month,
         statistics: statParams.statistics + ',grp-30-days'
      }), this.repliers.search({
         ...statParams,
         minSoldDate: periods.threeMonths,
         statistics: statParams.statistics + ',grp-90-days'
      }), this.repliers.search({
         ...statParams,
         minSoldDate: periods.year,
         statistics: statParams.statistics + ',grp-365-days'
      }), this.repliers.search({
         ...widgetParams,
         status: [RplStatus.A]
      }), this.repliers.search({
         ...widgetParams,
         minListDate: periods.historyMinDate,
         statistics: "cnt-new,grp-mth",
         status: [RplStatus.A, RplStatus.U]
      }), this.repliers.search({
         ...statParams,
         minSoldDate: periods.historyMinDate,
         statistics: statParams.statistics + ',grp-mth'
      })]);
      const newListingsCount = months.reduce((acc: Record<RplMonthFormat, {
         value: number | undefined;
      }>, month) => {
         acc[month] = {
            value: newResult.statistics.new.mth[month]?.count
         };
         return acc;
      }, {});
      const soldPerMonthCount = months.reduce((acc: Record<RplMonthFormat, {
         value: number | undefined;
      }>, month) => {
         acc[month] = {
            value: soldPerMonthResult.statistics.soldPrice.mth[month]?.count
         };
         return acc;
      }, {});
      const soldPerMonthMoment = months.reduce((acc: Record<RplMonthFormat, StatsMoment>, month) => {
         acc[month] = {
            avg: soldPerMonthResult.statistics.soldPrice.mth[month]?.avg || 0,
            med: soldPerMonthResult.statistics.soldPrice.mth[month]?.med || 0
         };
         return acc;
      }, {});
      const domMoment = months.reduce((acc: Record<RplMonthFormat, StatsMoment>, month) => {
         acc[month] = {
            avg: soldPerMonthResult.statistics.daysOnMarket.mth[month]?.avg || 0,
            med: soldPerMonthResult.statistics.daysOnMarket.mth[month]?.med || 0
         };
         return acc;
      }, {});
      const result = {
         area,
         city,
         neighborhood,
         community,
         class: params.class,
         district,
         widgets: {
            sold: {
               prices: {
                  month: {
                     avg: monthResult.statistics.soldPrice.avg,
                     med: monthResult.statistics.soldPrice.med
                  },
                  threeMonth: {
                     avg: threeMonthResult.statistics.soldPrice.avg,
                     med: threeMonthResult.statistics.soldPrice.med
                  },
                  year: {
                     avg: yearResult.statistics.soldPrice.avg,
                     med: yearResult.statistics.soldPrice.med
                  },
                  mth: {
                     ...soldPerMonthMoment
                  }
               },
               volume: {
                  month: {
                     value: monthResult.statistics.soldPrice.sum
                  },
                  threeMonth: {
                     value: threeMonthResult.statistics.soldPrice.sum
                  },
                  year: {
                     value: yearResult.statistics.soldPrice.sum
                  }
               },
               count: {
                  month: {
                     value: monthResult.count
                  },
                  threeMonth: {
                     value: threeMonthResult.count
                  },
                  year: {
                     value: yearResult.count
                  },
                  mth: {
                     ...soldPerMonthCount
                  }
               },
               dom: {
                  month: {
                     avg: monthResult.statistics.daysOnMarket.avg,
                     med: monthResult.statistics.daysOnMarket.med
                  },
                  threeMonth: {
                     avg: threeMonthResult.statistics.daysOnMarket.avg,
                     med: threeMonthResult.statistics.daysOnMarket.med
                  },
                  year: {
                     avg: yearResult.statistics.daysOnMarket.avg,
                     med: yearResult.statistics.daysOnMarket.med
                  },
                  mth: {
                     ...domMoment
                  }
               }
            },
            active: {
               count: {
                  value: activeResult.count
               }
            },
            new: {
               count: {
                  mth: {
                     ...newListingsCount
                  }
               }
            }
         }
      };
      return result;
   }
   calcPeriodAvg(stats: RplListingsSearchResponse, key: RplRollingPeriodName, currPeriodStart: string, prevPeriodStart: string): PeriodAvgStats {
      const today = dayjs().utc().format(RplDateFormatter);
      const avgCurrPeriod = `${currPeriodStart}_${today}`;
      const avgPrevPeriod = `${prevPeriodStart}_${currPeriodStart}`;
      debug({
         stats,
         avgCurrPeriod,
         avgPrevPeriod,
         key
      });
      debug(`stats.statistics.soldPrice[${key}]:`, stats.statistics.soldPrice[key]);
      const avgCurr = stats.statistics.soldPrice[key][avgCurrPeriod]!.avg;
      const avgPrev = stats.statistics.soldPrice[key][avgPrevPeriod]!.avg;
      let change: number;
      // If no data for prev or curr month, than treat it as no-change
      if (avgPrev === 0 || avgCurr === 0) {
         change = 0;
      } else {
         change = Math.round((avgCurr / avgPrev - 1) * 100);
      }
      return {
         change,
         avgCurrent: avgCurr,
         avgPrevious: avgPrev
      };
   }
   @cached("stats", config.cache.neighborhoodsranking.ttl_ms)
   async fetchStats(params: Pick<StatsNeighborhoodsrankingDto, "class">): Promise<FetchStatsReturn | Cached<FetchStatsReturn>> {
      const nbList = Object.entries(this.data.communities);
      return Promise.all(nbList.map(async ([neighborhood, district]) => {
         //listings?listings=false&statistics=avg-soldPrice%2Cgrp-mth&type=sale&status=U&class=condo&minSoldDate=2023-03-13&city=Ottawa&district=1001&district=1002
         const statsParams = {
            listings: false,
            type: [RplType.Sale],
            status: [RplStatus.U],
            class: params.class,
            // city: [params.city],
            district
         };
         const monthStats = await this.repliers.search({
            ...statsParams,
            statistics: "avg-soldPrice,grp-30-days",
            minSoldDate: dayjs().utc().subtract(60, "days").format(RplDateFormatter) as RplDateFormat
         });
         const quartalStats = await this.repliers.search({
            ...statsParams,
            statistics: "avg-soldPrice,grp-90-days",
            minSoldDate: dayjs().utc().subtract(180, "days").format(RplDateFormatter) as RplDateFormat
         });
         const yearStats = await this.repliers.search({
            ...statsParams,
            statistics: "avg-soldPrice,grp-365-days",
            minSoldDate: dayjs().utc().subtract(2, "year").format(RplDateFormatter) as RplDateFormat
         });

         // debug("RAW response for neighborghood %s - %j", neighborhood, singleStat);

         const lastMonth = dayjs().utc().subtract(30, "days").format(RplDateFormatter);
         const lastMonthPrev = dayjs().utc().subtract(60, "days").format(RplDateFormatter);
         const last3Month = dayjs().utc().subtract(90, "days").format(RplDateFormatter);
         const last3MonthPrev = dayjs().utc().subtract(180, "days").format(RplDateFormatter);
         const lastYear = dayjs().utc().subtract(365, "days").format(RplDateFormatter);
         const lastYearPrev = dayjs().utc().subtract(730, "days").format(RplDateFormatter);
         const {
            change: lastMonthChange,
            avgCurrent: lastMonthAvgCurr,
            avgPrevious: lastMonthAvgPrev
         } = this.calcPeriodAvg(monthStats, "grp-30-days", lastMonth, lastMonthPrev);
         const {
            change: last3MonthChange,
            avgCurrent: last3MonthAvgCurr,
            avgPrevious: last3MonthAvgPrev
         } = this.calcPeriodAvg(quartalStats, "grp-90-days", last3Month, last3MonthPrev);
         const {
            change: lastYearChange,
            avgCurrent: lastYearAvgCurr,
            avgPrevious: lastYearAvgPrev
         } = this.calcPeriodAvg(yearStats, "grp-365-days", lastYear, lastYearPrev);
         return {
            neighborhood,
            monthlyChange: {
               change: lastMonthChange,
               avgCurrent: lastMonthAvgCurr,
               avgPrevious: lastMonthAvgPrev
            },
            threeMonthChange: {
               change: last3MonthChange,
               avgCurrent: last3MonthAvgCurr,
               avgPrevious: last3MonthAvgPrev
            },
            yoyChange: {
               change: lastYearChange,
               avgCurrent: lastYearAvgCurr,
               avgPrevious: lastYearAvgPrev
            }
         };
      }));
   }
   getDistrictIds(community: string) {
      return this.data.communities[community] || [];
   }
   getCommunities(params: StatsCommunitiesDto) {
      if (!params.districtId) {
         return this.data.communities;
      }
      const community = this.data.revComunities[params.districtId];
      if (community && this.data.communities[community]) {
         return {
            [community]: this.data.communities[community]
         };
      }
      return undefined;
   }
}