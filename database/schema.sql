-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: library_management
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `book_copies`
--

DROP TABLE IF EXISTS `book_copies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_copies` (
  `copy_id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL,
  `copy_code` varchar(50) NOT NULL,
  `status` enum('AVAILABLE','BORROWED','LOST','DAMAGED') NOT NULL DEFAULT 'AVAILABLE',
  `location` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`copy_id`),
  UNIQUE KEY `copy_code` (`copy_code`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `book_copies_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `book_id` int NOT NULL AUTO_INCREMENT,
  `isbn` varchar(20) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(150) DEFAULT NULL,
  `publisher` varchar(150) DEFAULT NULL,
  `publish_year` int DEFAULT NULL,
  `category_id` int NOT NULL,
  `description` text,
  PRIMARY KEY (`book_id`),
  UNIQUE KEY `isbn` (`isbn`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `books_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `borrow_details`
--

DROP TABLE IF EXISTS `borrow_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrow_details` (
  `borrow_detail_id` int NOT NULL AUTO_INCREMENT,
  `borrow_id` int NOT NULL,
  `copy_id` int NOT NULL,
  `return_date` datetime DEFAULT NULL,
  `status` enum('BORROWED','RETURNED') NOT NULL DEFAULT 'BORROWED',
  PRIMARY KEY (`borrow_detail_id`),
  KEY `borrow_id` (`borrow_id`),
  KEY `copy_id` (`copy_id`),
  CONSTRAINT `borrow_details_ibfk_1` FOREIGN KEY (`borrow_id`) REFERENCES `borrow_tickets` (`borrow_id`),
  CONSTRAINT `borrow_details_ibfk_2` FOREIGN KEY (`copy_id`) REFERENCES `book_copies` (`copy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `borrow_tickets`
--

DROP TABLE IF EXISTS `borrow_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrow_tickets` (
  `borrow_id` int NOT NULL AUTO_INCREMENT,
  `reader_id` int NOT NULL,
  `librarian_id` int NOT NULL,
  `borrow_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `due_date` date NOT NULL,
  `status` enum('BORROWING','COMPLETED','OVERDUE') NOT NULL DEFAULT 'BORROWING',
  PRIMARY KEY (`borrow_id`),
  KEY `reader_id` (`reader_id`),
  KEY `librarian_id` (`librarian_id`),
  CONSTRAINT `borrow_tickets_ibfk_1` FOREIGN KEY (`reader_id`) REFERENCES `readers` (`reader_id`),
  CONSTRAINT `borrow_tickets_ibfk_2` FOREIGN KEY (`librarian_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fines`
--

DROP TABLE IF EXISTS `fines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fines` (
  `fine_id` int NOT NULL AUTO_INCREMENT,
  `borrow_detail_id` int NOT NULL,
  `late_days` int NOT NULL DEFAULT '0',
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `reason` varchar(255) DEFAULT NULL,
  `status` enum('UNPAID','PAID') NOT NULL DEFAULT 'UNPAID',
  `paid_at` datetime DEFAULT NULL,
  PRIMARY KEY (`fine_id`),
  UNIQUE KEY `borrow_detail_id` (`borrow_detail_id`),
  CONSTRAINT `fines_ibfk_1` FOREIGN KEY (`borrow_detail_id`) REFERENCES `borrow_details` (`borrow_detail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `readers`
--

DROP TABLE IF EXISTS `readers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `readers` (
  `reader_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `reader_code` varchar(20) NOT NULL,
  `reader_type` enum('STUDENT','TEACHER') NOT NULL,
  `class_name` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  PRIMARY KEY (`reader_id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `reader_code` (`reader_code`),
  CONSTRAINT `readers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `regulations`
--

DROP TABLE IF EXISTS `regulations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regulations` (
  `regulation_id` int NOT NULL AUTO_INCREMENT,
  `max_books` int NOT NULL,
  `borrow_days` int NOT NULL,
  `fine_per_day` decimal(10,2) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  PRIMARY KEY (`regulation_id`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `regulations_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `chk_regulation_dates` CHECK (((`effective_to` is null) or (`effective_to` >= `effective_from`)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role_id` int NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-15 20:52:33
