if [ -z "$1" ]; then
  fName=".env"
else
  fName="$1"
fi

source "$fName"
docker run \
  --name="repliers_pg-$DB_NAME" \
  --env=POSTGRES_PASSWORD=$DB_PASSWORD \
  -e POSTGRES_DB=$DB_NAME \
  -p $DB_PORT:5432 \
  -d postgres:16-alpine
