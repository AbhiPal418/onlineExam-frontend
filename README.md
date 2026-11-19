<!-- # React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project. -->


# Test Zone
##  A Online Examination Portal

A full-stack web-based Online Examination Portal built using the **MERN Stack (MongoDB, Express.js, React.js, and Node.js)**. The application provides a platform where teachers can create and manage online examinations, while students can securely attend exams, submit answers, and view their results.

The system is designed to simplify the examination process by providing role-based access, secure authentication, timed examinations, automated evaluation, and result management.

---

##  Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Project Structure](#-project-structure)
- [Workflow]
- [Examination and Evaluation](#-examination-and-evaluation)
- [Security Features](#-security-features)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

##  Project Overview

Test Zone  is a web-based examination management system that digitizes the traditional examination process.

It provides two different interfaces based on user roles:

- **Teacher:** Can create examinations, manage created exams, monitor student performance, and download examination results.
- **Student:** Can explore available examinations, participate in password-protected exams, submit answers, and view examination results.

### Project Objectives

- To provide a centralized platform for conducting online examinations.
- To simplify examination creation and management.
- To provide secure authentication and role-based authorization.
- To automate examination evaluation and result generation.
- To reduce manual work for teachers.
- To provide students with an accessible examination environment.

---

## Key Features

###  Authentication and Authorization

- Student and Teacher registration.
- Secure user login and logout.
- Password hashing using Bcrypt.
- JWT-based authentication.
- Access token and refresh token management.
- Cookie-based token storage.
- Role-based access control.
- Change password functionality.

###  Teacher Features

- Dedicated Teacher Dashboard.
- Create examinations with multiple-choice questions (MCQs).
- Configure examination duration.
- Set examination passwords.
- Add questions with four answer options.
- Specify the correct answer for each question.
- View all created examinations.
- View examination results.
- Download examination results.

###  Student Features

- Dedicated Student Dashboard.
- View available examinations.
- Search for examinations.
- Access password-protected examinations.
- Attend timed examinations.
- Navigate between examination questions.
- Select and modify answers before submission.
- Submit examination responses.
- View results.
- Track previously attempted examinations.
- Manage student profile.
- Change account password.

###  Examination Management

- Dynamic examination creation.
- Multiple-choice question management.
- Configurable examination duration.
- Automatic timer management.
- Password-protected examinations.
- Automatic answer evaluation.
- Score calculation.
- Examination submission and result storage.
- Prevention of repeated examination attempts.

###  Result Management

- Automatic result calculation.
- Student-wise result tracking.
- Score and percentage calculation.
- Examination status management.
- Teacher-side result visualization.
- Downloadable examination reports.

---

##  User Roles

The application supports two types of authenticated users.

### 1. Teacher

Teachers are responsible for creating and managing examinations.

**Available Operations:**
- Register and log in.
- Access the Teacher Dashboard.
- Create new examinations.
- Add and manage MCQ questions.
- Set examination passwords and time limits.
- View created examinations.
- View student results.
- Download examination reports.

### 2. Student

Students can participate in examinations created by teachers.

**Available Operations:**
- Register and log in.
- Access the Student Dashboard.
- View available examinations.
- Search for examinations.
- Enter examination passwords.
- Attend timed examinations.
- Submit answers.
- View examination results.
- View attempted examinations.
- Update profile information and passwords.

---

##  Technology Stack

The project is developed using the MERN Stack along with additional libraries and tools.

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| CSS3 | Application styling |
| JavaScript | Application logic |
| Node.js | Backend runtime environment |
| Express.js | REST API development |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| JSON Web Token (JWT) | Authentication |
| Bcrypt | Password hashing |
| Axios | HTTP requests |
| React Router DOM | Frontend routing |
| Cookie Parser | Cookie handling |
| CORS | Cross-origin resource sharing |
| Dotenv | Environment variable management |


### Development Tools

- Visual Studio Code
- MongoDB Compass
- Postman
- Git and GitHub
- npm

---

##  Project Architecture

The application follows a client-server architecture.

```text
              USER
               |
               |
        React Frontend
               |
               | HTTP Requests
               | (Axios)
               |
        Express.js Server
               |
               |
        Backend API Routes
               |
               |
           Controllers
               |
               |
            Models
               |
               |
         MongoDB Database
```

### Architecture Explanation

1. **Frontend:** React.js handles the user interface, navigation, forms, dashboards, and examination interface.
2. **Backend:** Node.js and Express.js process incoming requests and implement application logic.
3. **Controllers:** Handle authentication, examination operations, user management, and result processing.
4. **Models:** Define database schemas using Mongoose.
5. **Database:** MongoDB stores users, examinations, questions, and results.

---

##  Project Structure

The project is divided into two main directories: `frontend` and `backend`.

```text
Online-Examination-Portal/
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
|   |__ .gitignore
| 
│
├── backend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── db/
│   │   ├── app.js
│   │   └── index.js
│   │
│   ├── .env
│   └── package.json
|   ├── .gitignore
|   └── README.md


```
## Workflow

### Teacher Workflow

1. Teacher registers an account.
2. Teacher logs into the application.
3. Teacher accesses the Teacher Dashboard.
4. Teacher creates a new examination.
5. Teacher adds MCQ questions and configures examination settings.
6. Teacher publishes the examination.
7. Students can access the available examination.
8. Teacher views student performance and examination results.
9. Teacher downloads the result report.

### Student Workflow

1. Student registers an account.
2. Student logs into the application.
3. Student accesses the Student Dashboard.
4. Student explores available examinations.
5. Student selects an examination.
6. Student enters the examination password.
7. After successful verification, the examination begins.
8. Student answers the questions within the allocated time.
9. Student submits the examination.
10. The system evaluates the answers and generates the result.
11. Student views the examination result.

---

##  Examination and Evaluation

The examination system supports multiple-choice questions (MCQs).

Each question contains:

- One question statement.
- Four answer options.
- One correct answer.

### Evaluation System

The application uses an automatic evaluation mechanism to calculate examination scores.

The scoring system is:

| Response | Marks |
|---|---:|
| Correct Answer | +4 |
| Incorrect Answer | -1 |
| Unattempted Question | 0 |

### Score Calculation

```text
Total Score =
(Correct Answers × 4) -
(Incorrect Answers × 1)
```

### Percentage Calculation

```text
Percentage = (Obtained Marks / Maximum Marks) × 100
```

The evaluation is performed automatically after examination submission.

---

##  Security Features

Security is an important aspect of the Online Examination Portal.

The application incorporates the following security mechanisms:

- Password hashing using Bcrypt.
- JWT-based authentication.
- Access token and refresh token management.
- HTTP cookie-based authentication.
- Role-based authorization for Teachers and Students.
- Protected backend routes.
- Password verification before accessing restricted examinations.
- Environment-based secret management.
- Prevention of unauthorized access to protected resources.

---

##  Future Enhancements

The following features can be considered for future development:

- Admin dashboard for managing users and examinations.
- Email verification during registration.
- Examination scheduling.
- Negative marking configuration.
- Randomized question and option ordering.
- Question bank management.
- Advanced performance analytics.
- Leaderboards and ranking systems.
- Certificate generation after successful examinations.
- Enhanced anti-cheating mechanisms.
- Online examination monitoring.
- Mobile application support.

---

---

##  License

This project is developed for educational and academic purposes.

---

##  Author

**Abhi Pal**

Computer Science Student | Full-Stack Developer

- GitHub: [AbhiPal418](https://github.com/AbhiPal418)

---

If you find this project useful, consider giving the repository a star!

