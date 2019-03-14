# IZTAPP

**Description:** This is the official repo of IZTAPP.

---

## Usage

- git clone https://github.com/abdullah-eryuzlu/iztapp.git ./iztapp
- cd iztapp
- npm run i
- npm run start

## Commits

- git add .
- npm run commit
- **Fill the form**
- git push origin development

---

## Technologies

### Backend

Node.js, Koa.js and MongoDB

### Frontend

Nunjucks, Bootstrap 4, Additional CSS (sass if needed), Jquery (if needed)

---

## Project Structure

**ROOT**

- ./public/ --> images, favicons etc.
- ./scripts/ --> additional scripts which do not affect the project
- ./src/
  - ./src/controllers/ --> Route controllers
  - ./src/locales/ --> Language files
  - ./src/models/
    - ./src/models/schemas/ --> Database schemas
    - ./src/models/repositories/ --> Repos of schemas which includes implementations of model functionalities (e.g : login middlewares)
    - ./src/models/factories/ --> Package of related repos
  - ./src/views/
    - ./src/views/pages/ --> All existed pages
    - ./src/views/assets/ --> All assets
    - ./src/views/mails/ --> All mail templates
  - ./src/config.js --> All configurations of the application (e.g : port, domains, locales, errors etc.)
  - ./src/helpers.js --> All helper functions which are not related with a task directly (e.g : generateHash, generatePasswordHash, generateUrlString, comparePassword)
  - ./src/limits.js --> All limitations of application (e.g : user password max limit)
  - ./src/server.js --> The main code which starts the server
- ./.editorconfig --> Configurations of text editor to keep organized
- ./.eslintrc --> JS Style configurations
- ./.eslintignore --> Which JS files will be ignored from styling
- ./.gitignore --> Which files won't be pushed
- ./LICENCE --> MIT Licence
- ./package.json, ./package-lock.json --> NPM configurations
- ./README.md --> Current file that you are reading
