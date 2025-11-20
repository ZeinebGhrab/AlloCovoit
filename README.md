# 🚗 AlloCovoit - Carpooling Platform
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![PHP](https://img.shields.io/badge/PHP-7.4%252B-777BB4?logo=php)]()
[![MySQL](https://img.shields.io/badge/MySQL-5.7%252B-4479A1?logo=mysql)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%252B-F7DF1E?logo=javascript)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

AlloCovoit is a modern web application for **carpooling**, built with **Vanilla JavaScript, PHP, and MySQL**.  
It allows users to share trips, manage reservations, and connect with other travelers securely.

---

## 📋 Features

### User Features
- **Authentication:** secure signup/login, password hashing (bcrypt), session management
- **Browse Trips:** filter by departure/arrival city and date, detailed trip info, pagination
- **Publish Trips:** create trips with admin validation
- **Reservation System:** add trips to cart, adjust seats, real-time availability check
- **Manage Reservations:** confirm, cancel, track status
- **Real-Time Updates:** AJAX-based dynamic UI
- **Email Notifications:** account updates, trip validations, reservation confirmations

### Admin Features
- **Dashboard:** overview of users, trips, reservations
- **User Management:** block/unblock/delete users, view activity
- **Trip Management:** validate/refuse trips, remove inappropriate trips
- **Reservation Monitoring:** view all reservations, track activity

---

## 🛠️ Technology Stack

**Frontend:** HTML5/CSS3, Vanilla JS ES6+, Font Awesome  
**Backend:** PHP 7.4+, MySQL 5.7+, PHPMailer, RESTful API  
**Tools:** Composer, phpdotenv

---

## 📁 Project Structure

```bash
AlloCovoit/
├─ front-end/
│   ├─ interfaces/
│   │   ├─ admin/
│   │   │   └─ dashboard.html            # Admin panel
│   │   ├─ authentication/
│   │   │   ├─ login.html                # Login page
│   │   │   └─ sign.html                 # Sign up page
│   │   ├─ reservation/
│   │   │   └─ ride-request.html         # Manage ride requests/reservations
│   │   ├─ route/
│   │   │   ├─ publication.html          # Post a new ride
│   │   │   ├─ ride-cart.html            # Ride cart
│   │   │   └─ ride-publication.html     # My published rides
│   │   └─ main.html                     # Browse all rides (home)
│   ├─ script/
│   │   ├─ administration/
│   │   │   └─ dashboard.js              # Admin logic
│   │   ├─ authentication/
│   │   │   ├─ auth.js                   # Session management
│   │   │   ├─ login.js                  # Login handling
│   │   │   └─ sign.js                   # Signup handling
│   │   ├─ reservation/
│   │   │   └─ ride-request.js           # Reservation handling
│   │   ├─ main.js                       # App initialization
│   │   ├─ navigation.js                 # Navigation logic
│   │   ├─ trajets.js                    # Ride navigation
│   │   ├─ panier.js                     # Cart management
│   │   ├─ mesTrajets.js                 # My rides management
│   │   ├─ publication.js                # Ride publishing
│   │   └─ utils.js                      # Utility functions
│   └─ styles/
│       ├─ style.css                     # Main styles
│       ├─ dashboard-admin.css           # Admin panel styles
│       └─ ride_request.css              # Reservation styles
│
├─ back-end/
│   ├─ config/
│   │   └─ Database.php                  # MySQL connection manager
│   │
│   ├─ user/
│   │   ├─ api/
│   │   │   ├─ auth/
│   │   │   │   ├─ check_session.php     # Session validation
│   │   │   │   ├─ check_session_logic.php     # Route validation
│   │   │   │   ├─ login.php             # User login
│   │   │   │   └─ logout.php            # Logout
│   │   │   └─ user/
│   │   │       ├─ save.php              # Register user
│   │   │       ├─ get_users.php         # Get users (admin)
│   │   │       ├─ get_total_users.php   # Total users
│   │   │       ├─ block_user.php        # Block user
│   │   │       ├─ unblock_user.php      # Unblock user
│   │   │       └─ delete_user.php       # Delete user
│   │   └─ models/
│   │       ├─ User.php                  # User entity class
│   │       └─ UserManager.php           # CRUD + email notifications
│   │
│   ├─ route/
│   │   ├─ api/
│   │   │   ├─ save.php                  # Create new ride
│   │   │   ├─ get_routes.php            # Get validated rides
│   │   │   ├─ get_routes_admin.php      # Get all rides (admin)
│   │   │   ├─ get_my_routes.php         # User's rides
│   │   │   ├─ get_total_trajets.php     # Total rides
│   │   │   ├─ validate_route.php        # Admin approve ride
│   │   │   ├─ refuse_route.php          # Admin refuse ride
│   │   │   ├─ cancel.php                # Driver cancel ride
│   │   │   ├─ delete.php                # Delete ride
│   │   │   ├─ session_routes.php        # Manage cart session
│   │   │   └─ .gitignore
│   │   └─ models/
│   │       ├─ Trajet.php                # Ride entity class
│   │       └─ TrajetManager.php         # CRUD + email notifications
│   │
│   ├─ reservation/
│   │   ├─ api/
│   │   │   ├─ create_reservation.php
│   │   │   ├─ get_user_reservation.php
│   │   │   ├─ get_received_request.php
│   │   │   ├─ get_reservations_count.php
│   │   │   ├─ confirm_reservation.php
│   │   │   ├─ get_total_reservation.php
│   │   │   └─ cancel_reservation.php
│   │   └─ models/
│   │       ├─ Reservation.php
│   │       └─ ReservationManager.php
│   │
│   └─ phpmailer/
│       └─ src/
│           ├─ PHPMailer.php
│           ├─ SMTP.php
│           └─ Exception.php
│
├─ database/
│   └─ allocovoit_database_sql.sql       # Database schema + test data
├─ vendor/                               # Composer dependencies
│   ├─ autoload.php
│   └─ vlucas/phpdotenv/
├─ .env                                  # Environment config
├─ .gitignore
├─ composer.json
├─ composer.lock
└─ README.md
```

---

## 💾 Installation

**Prerequisites**
- PHP 7.4+
- MySQL 5.7+
- Composer
- Web server (Apache/Nginx)
- Modern browser

**Steps**
1. Clone the repository:

```bash
git clone https://github.com/ZeinebGhrab/AlloCovoit.git
cd AlloCovoit
```

2. Install PHP dependencies:

```bash
composer install
```

3. Configure the database:

Import database/allocovoit_database_sql.sql in MySQL

Update back-end/config/Database.php with your credentials

4. Set up .env for emails:

```bash
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_PORT=587
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=AlloCovoit
```
5. Access the app:

```bash
http://localhost/AlloCovoit/front-end/interfaces/main.html
```

---

## 💡 Usage

**For Users**

- Register, login, browse trips

- Add trips to cart and book

- Publish trips for admin validation

- Manage reservations (cancel, track status)

- Receive email notifications

**For Admins**

- Access dashboard

- Manage users (block/unblock/delete)

- Validate/refuse trips

- Monitor all reservations

---

## 💻 Database Configuration

Database connection is handled in back-end/config/Database.php:

```bash
class Database {
    private $host = "localhost";
    private $user = "root";
    private $password = "";
    private $dbname = "allocovoit";
}
```

**Tables**

- utilisateur (users)

- trajet (trips)

- reservation (reservations)

---

## 📝 License

MIT License © Zeineb Ghrab

---

## 🤝 Contributions
Pull requests are welcome! For major changes, please open an issue first.

---

## 🙋 About the Developer
Built with dedication by Zeineb Ghrab  
🎓 Data Science Engineer | 🧠 Passionate about data, AI, and full-stack development