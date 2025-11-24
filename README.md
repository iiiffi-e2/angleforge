This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ installed locally

### PostgreSQL Setup (Windows)

#### Step 1: Install PostgreSQL

If you haven't installed PostgreSQL yet:

1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. **Important:** Remember the password you set for the `postgres` superuser account
4. Make sure to install PostgreSQL on port `5432` (default)
5. Optionally install pgAdmin 4 (GUI tool for managing PostgreSQL)

#### Step 2: Verify PostgreSQL Installation

1. **Check if PostgreSQL service is running:**
   - Press `Win + R`, type `services.msc`, press Enter
   - Look for "postgresql-x64-XX" service (where XX is your version)
   - Ensure it's set to "Running" and "Automatic" startup type

2. **Test connection via Command Prompt:**
   ```cmd
   psql -U postgres
   ```
   - Enter the password you set during installation
   - If successful, you'll see `postgres=#` prompt
   - Type `\q` to exit

   **Note:** If `psql` is not recognized, add PostgreSQL's `bin` folder to your PATH:
   - Usually located at: `C:\Program Files\PostgreSQL\XX\bin`
   - Add it to System Environment Variables → Path

#### Step 3: Create the Database

You have three options:

**Option A: Using psql (Command Line) - If psql is in PATH**

If `psql` command works:
```cmd
psql -U postgres
```
Then in the psql prompt:
```sql
CREATE DATABASE angleforge;
\q
```

**Option A1: Using psql with Full Path (If psql is NOT in PATH)**

1. Find your PostgreSQL installation:
   - Common locations:
     - `C:\Program Files\PostgreSQL\15\bin\psql.exe`
     - `C:\Program Files\PostgreSQL\16\bin\psql.exe`
     - `C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe`
   
2. Use the full path to run psql:
   ```powershell
   & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
   ```
   (Replace `15` with your PostgreSQL version number)

3. In the psql prompt:
   ```sql
   CREATE DATABASE angleforge;
   \q
   ```

**Option A2: Add PostgreSQL to PATH (Permanent Solution)**

1. Find your PostgreSQL bin folder (usually `C:\Program Files\PostgreSQL\XX\bin`)
2. Press `Win + X` → System → Advanced system settings
3. Click "Environment Variables"
4. Under "System variables", find and select "Path", then click "Edit"
5. Click "New" and add: `C:\Program Files\PostgreSQL\XX\bin` (replace XX with your version)
6. Click OK on all dialogs
7. **Restart your terminal/PowerShell** for changes to take effect
8. Now `psql` should work from anywhere

**Option B: Using pgAdmin (GUI) - Easiest Method**
1. Open pgAdmin 4 (installed with PostgreSQL)
2. Connect to your PostgreSQL server:
   - Enter the password you set during installation
3. Right-click on "Databases" → Create → Database
4. Name it `angleforge`
5. Click Save

**Option C: Let Prisma Create It Automatically (Easiest for Development)**

If your PostgreSQL user has database creation permissions, you can skip manual database creation and let Prisma handle it:

1. Update your `.env` to point to the `postgres` database (default database):
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres"
   ```

2. Run:
   ```bash
   npm run db:push
   ```
   
   Prisma will create the `angleforge` database automatically if it has permissions. If not, you'll need to create it manually using one of the options above.

#### Step 4: Configure Environment Variables

1. Open the `.env` file in the project root
2. Update the `DATABASE_URL` with your PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/angleforge"
   ```
   Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

   **Format:** `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME`

   **Common variations:**
   - If you created a different user: `postgresql://myuser:mypassword@localhost:5432/angleforge`
   - If using a different port: `postgresql://postgres:password@localhost:5433/angleforge`

### Application Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
   This will automatically generate Prisma Client via the `postinstall` script.

2. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```
   (This should already run automatically after `npm install`)

3. **Push the database schema:**
   ```bash
   npm run db:push
   ```
   This creates all the tables in your PostgreSQL database based on your Prisma schema.

   **Alternative - Use Migrations (recommended for production):**
   ```bash
   npm run db:migrate
   ```
   This creates a migration file that you can version control.

4. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```
   This populates your database with initial data if you have a seed file.

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Troubleshooting

#### PostgreSQL Connection Issues

**Error: "Can't reach database server at `localhost:5432`"**
- Verify PostgreSQL service is running (see Step 2 above)
- Check if PostgreSQL is running on port 5432:
  ```cmd
   netstat -an | findstr 5432
   ```
- Verify your `DATABASE_URL` in `.env` is correct
- Try connecting manually: `psql -U postgres -h localhost -p 5432`

**Error: "password authentication failed"**
- Double-check the password in your `DATABASE_URL`
- Try connecting manually to verify credentials: `psql -U postgres`
- If you forgot the password, you may need to reset it or create a new user

**Error: "database does not exist"**
- Make sure you created the database (see Step 3 above)
- Verify the database name in `DATABASE_URL` matches the created database
- List all databases: `psql -U postgres -c "\l"`

**Error: "psql is not recognized"**
- Add PostgreSQL bin folder to your PATH environment variable
- Or use the full path: `"C:\Program Files\PostgreSQL\XX\bin\psql.exe" -U postgres`

#### Prisma Issues

**Error: "Failed to load external module @prisma/client"**
- Run: `npm run db:generate`
- Make sure `node_modules/.prisma` folder exists after generation

**Error: "P1001: Can't reach database server"**
- Ensure PostgreSQL service is running
- Verify `DATABASE_URL` in `.env` is correct
- Check firewall settings (PostgreSQL port 5432 should be accessible)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
