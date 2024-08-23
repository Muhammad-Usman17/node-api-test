
## Description

User Resource and Identity management. 

1. USER can view their own details.
2. USER can update their own details.
3. ADMIN can get a list of users.
4. ADMIN can update the role and details of other users.
5. ADMIN can delete users.
6. No role can delete themselves.
7. USERS attempting to view things they are not allowed to do should receive the correct status code.
8. ADMINS attempting to do things to non-existent users should receive the correct status codes.

## Project Tools

1. Node Framework: Nest JS
2. Database: MySQL
3. ORM: TypeORM
4. Validator: class-validator
5. Encryption: BcryptJS
6. Authentication & Authorization: JWT & Passport
7. Test cases: Jest & supertest
   


## Project setup

copy .env-example to root and rename it to .enV 

```bash

$ docker-compose up

$ pnpm install


```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e


```

