# App made with Symfony 4 and <3

## Setup

**1. Installation of dependencies**
```
    composer install
```

**2. Create a new database**
```
   php bin/console doctrine:database:create
```

**3. Create migrations**
```
   php bin/console make:migration
```

**4. Run migrations**
```
   php bin/console doctrine:migrations:migrate
```

**5. Start the web server, can be with symfony-cli**
```
   symfony serve
```

Check out at `http://localhost:8000`

Now is time to focus-focus through the Pummarole App!...