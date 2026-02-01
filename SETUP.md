# Environment Setup

The `.env` file in `packages/api/` should contain:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/balansertefakta?schema=public"
PORT=4000
NODE_ENV=development
```

If you're still getting authentication errors, you can test the connection with:

```powershell
# Test PostgreSQL is running
docker ps | Select-String balansertefakta-db

# Test direct connection
docker exec balansertefakta-db psql -U postgres -d balansertefakta -c "\dt"
```

Note: Make sure your `.env` file doesn't have any extra quotes or spaces around the DATABASE_URL value.
