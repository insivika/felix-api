import axios, { AxiosInstance } from "axios";
import { inject, injectable } from "tsyringe";
import type { Logger } from "pino";
import type { AppConfig } from "../config.js";
import { ApiError } from "../lib/errors.js";

export interface StrapiRegisterDto {
   username: string;
   email: string;
   password: string;
   firstName?: string;
   lastName?: string;
}

export interface StrapiLoginDto {
   identifier: string; // email or username
   password: string;
}

export interface StrapiAuthResponse {
   jwt: string;
   user: {
      id: number;
      username: string;
      email: string;
      confirmed: boolean;
      blocked: boolean;
      createdAt: string;
      updatedAt: string;
      firstName?: string;
      lastName?: string;
   };
}

export interface StrapiUser {
   id: number;
   username: string;
   email: string;
   provider: string;
   confirmed: boolean;
   blocked: boolean;
   createdAt: string;
   updatedAt: string;
   firstName?: string;
   lastName?: string;
   clientId?: number;
}

export interface ArticlesParams {
   pageNum?: number;
   pageSize?: number;
   categoryId?: string;
   isFeatured?: boolean;
}

export interface ArticlesResponse {
   data: any[];
   meta: {
      pagination: {
         page: number;
         pageSize: number;
         total: number;
         pageCount: number;
      };
   };
}

const ARTICLES_PAGE_SIZE = 10;

@injectable()
export default class StrapiService {
   private client: AxiosInstance;

   constructor(
      @inject("logger") private logger: Logger,
      @inject("config") private config: AppConfig
   ) {
      this.client = axios.create({
         baseURL: config.strapi.base_url,
         timeout: config.strapi.timeout_ms || 5000,
         headers: {
            "Content-Type": "application/json",
         },
      });
   }

   /**
    * Register a new user in Strapi
    */
   async register(data: StrapiRegisterDto): Promise<StrapiAuthResponse> {
      try {
         const response = await this.client.post<StrapiAuthResponse>(
            "/api/auth/local/register",
            data
         );
         return response.data;
      } catch (error: any) {
         this.logger.error(
            { error: error.response?.data },
            "[StrapiService: register]: Failed to register user"
         );

         // Handle specific Strapi errors
         if (error.response?.status === 400) {
            const strapiError =
               error.response?.data?.error?.message || "Registration failed";
            throw new ApiError(strapiError, 400);
         }

         throw new ApiError("Registration service unavailable", 503);
      }
   }

   /**
    * Login a user in Strapi
    */
   async login(data: StrapiLoginDto): Promise<StrapiAuthResponse> {
      try {
         const response = await this.client.post<StrapiAuthResponse>(
            "/api/auth/local",
            data
         );
         return response.data;
      } catch (error: any) {
         this.logger.error(
            { error: error.response?.data },
            "[StrapiService: login]: Failed to login user"
         );

         if (error.response?.status === 400) {
            throw new ApiError("Invalid credentials", 401);
         }

         throw new ApiError("Authentication service unavailable", 503);
      }
   }

   /**
    * Get user by JWT token
    */
   async getMe(token: string): Promise<StrapiUser> {
      try {
         const response = await this.client.get<StrapiUser>("/api/users/me", {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });
         return response.data;
      } catch (error: any) {
         this.logger.error(
            { error: error.response?.data },
            "[StrapiService: getMe]: Failed to get user info"
         );

         if (error.response?.status === 401) {
            throw new ApiError("Invalid or expired token", 401);
         }

         throw new ApiError("Authentication service unavailable", 503);
      }
   }

   /**
    * Update user in Strapi
    */
   async updateUser(id: number, data: Partial<StrapiUser>): Promise<void> {
      try {
         await this.client.put(`/api/users/${id}`, data, {
            headers: {
               Authorization: `Bearer ${this.config.strapi.api_key}`,
            },
         });
      } catch (error: any) {
         this.logger.error(
            { error: error.response?.data },
            "[StrapiService: update]: Failed to update user"
         );

         throw new ApiError("Update service unavailable", 503);
      }
   }

   /**
    * Send password reset email
    */
   async forgotPassword(email: string): Promise<{ ok: boolean }> {
      try {
         const response = await this.client.post("/api/auth/forgot-password", {
            email,
         });
         return response.data;
      } catch (error: any) {
         this.logger.error(
            { error: error.response?.data },
            "[StrapiService: forgotPassword]: Failed to send reset email"
         );

         throw new ApiError("Password reset service unavailable", 503);
      }
   }

   /**
    * Reset password with code
    */
   async resetPassword(
      code: string,
      password: string,
      passwordConfirmation: string
   ): Promise<StrapiAuthResponse> {
      try {
         const response = await this.client.post<StrapiAuthResponse>(
            "/api/auth/reset-password",
            {
               code,
               password,
               passwordConfirmation,
            }
         );
         return response.data;
      } catch (error: any) {
         this.logger.error(
            { error: error.response?.data },
            "[StrapiService: resetPassword]: Failed to reset password"
         );

         if (error.response?.status === 400) {
            throw new ApiError("Invalid or expired reset code", 400);
         }

         throw new ApiError("Password reset service unavailable", 503);
      }
   }

   /**
    * Get articles with optional pagination and category filtering
    */
   async getArticles({
      pageNum,
      pageSize,
      isFeatured = false,
   }: ArticlesParams = {}): Promise<ArticlesResponse> {
      try {
         let articlesUri = `/api/articles?pagination[page]=${pageNum}&pagination[pageSize]=${pageSize}&_sort=createdAt:DESC`;
         if (isFeatured === true) {
            articlesUri += `&filters[isFeatured][$eq]=true`;
         }

         const articles = await this.client.get<ArticlesResponse>(articlesUri, {
            headers: {
               Authorization: `Bearer ${this.config.strapi.api_key}`,
            },
         });

         return articles.data;
      } catch (error: any) {
         this.logger.error(
            { error: error.response?.data },
            "[StrapiService: getArticles]: Failed to fetch articles"
         );

         return {
            data: [],
            meta: {
               pagination: {
                  page: 0,
                  pageSize: 0,
                  total: 0,
                  pageCount: 0,
               },
            },
         };
      }
   }

   /**
    * Get a single article by slug
    */
   async getArticleBySlug(slug: string): Promise<any | null> {
      try {
         const uri = `/api/articles/${slug}`;

         const response = await this.client.get<any[]>(uri, {
            headers: {
               Authorization: `Bearer ${this.config.strapi.api_key}`,
            },
         });

         return response.data || null;
      } catch (error: any) {
         this.logger.error(
            { error: error.response?.data },
            "[StrapiService: getArticleBySlug]: Failed to fetch article"
         );

         return null;
      }
   }

   /**
    * Get article categories
    */
   async getArticleCategories(): Promise<any | null> {
      try {
         const uri = `/api/article-categories`;

         const { data } = await this.client.get<any[]>(uri, {
            headers: {
               Authorization: `Bearer ${this.config.strapi.api_key}`,
            },
         });

         console.log(data);

         return data;
      } catch (error: any) {
         this.logger.error(
            { error: error.response?.data },
            "[StrapiService: getArticleCategory]: Failed to fetch article category"
         );

         return null;
      }
   }

   /**
    * Get article category by slug
    */
   async getArticleCategoryBySlug(slug: string): Promise<any | null> {
      try {
         const uri = `/api/article-categories/${slug}`;

         const { data } = await this.client.get<any[]>(uri, {
            headers: {
               Authorization: `Bearer ${this.config.strapi.api_key}`,
            },
         });

         return data;
      } catch (error: any) {
         this.logger.error(
            { error: error.response?.data },
            "[StrapiService: getArticleCategoryBySlug]: Failed to fetch article category"
         );

         return null;
      }
   }
}
