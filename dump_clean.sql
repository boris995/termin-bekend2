-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: football_faceoff
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- GTID state at the beginning of the backup 
--

--
-- Table structure for table `cms_blocks`
--

DROP TABLE IF EXISTS `cms_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cms_blocks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `type` enum('text','news','announcement') NOT NULL DEFAULT 'text',
  `imageUrl` varchar(255) DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isPublished` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_blocks`
--

LOCK TABLES `cms_blocks` WRITE;
/*!40000 ALTER TABLE `cms_blocks` DISABLE KEYS */;
INSERT INTO `cms_blocks` VALUES (1,'Live workflow je spreman','Najavljeni mec automatski prelazi u live kada dodje zakazani termin. Admin nakon kraja bira ucesnike, upisuje rezultat, golove i asistencije.','announcement',NULL,1,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(2,'Publika bira igraca utakmice','Nakon objave rezultata posjetioci mogu anonimno glasati za igraca utakmice i ocijeniti svakog ucesnika ocjenom od 1 do 10.','news',NULL,2,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(3,'Derbi sa trinaest igraca u rotaciji','Seed sada ima vise igraca, vise statistike i primjer glasanja kako bi javne stranice imale dovoljno sadrzaja odmah nakon pokretanja.','text',NULL,3,1,'2026-05-19 20:39:10','2026-05-19 20:39:10');
/*!40000 ALTER TABLE `cms_blocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_player_ratings`
--

DROP TABLE IF EXISTS `match_player_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_player_ratings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `matchId` int unsigned NOT NULL,
  `playerId` int unsigned NOT NULL,
  `voterKey` varchar(80) NOT NULL,
  `rating` int unsigned NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `match_player_ratings_match_id_player_id_voter_key` (`matchId`,`playerId`,`voterKey`),
  KEY `playerId` (`playerId`),
  CONSTRAINT `match_player_ratings_ibfk_15` FOREIGN KEY (`matchId`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `match_player_ratings_ibfk_16` FOREIGN KEY (`playerId`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_player_ratings`
--

LOCK TABLES `match_player_ratings` WRITE;
/*!40000 ALTER TABLE `match_player_ratings` DISABLE KEYS */;
INSERT INTO `match_player_ratings` VALUES (1,18,1,'seed-rating-0001',9,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(2,18,3,'seed-rating-0002',8,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(3,18,9,'seed-rating-0003',7,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(4,18,8,'seed-rating-0004',8,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(5,5,1,'voter-315a67fe-08b4-4c00-ae45-a48b7ca7036e',10,'2026-05-19 20:58:56','2026-05-19 20:58:56'),(6,5,5,'voter-315a67fe-08b4-4c00-ae45-a48b7ca7036e',5,'2026-05-19 21:01:43','2026-05-19 21:01:43'),(7,5,4,'voter-315a67fe-08b4-4c00-ae45-a48b7ca7036e',3,'2026-05-19 21:01:50','2026-05-19 21:01:50');
/*!40000 ALTER TABLE `match_player_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match_player_votes`
--

DROP TABLE IF EXISTS `match_player_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_player_votes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `matchId` int unsigned NOT NULL,
  `playerId` int unsigned NOT NULL,
  `voterKey` varchar(80) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `match_player_votes_match_id_voter_key` (`matchId`,`voterKey`),
  KEY `playerId` (`playerId`),
  CONSTRAINT `match_player_votes_ibfk_15` FOREIGN KEY (`matchId`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `match_player_votes_ibfk_16` FOREIGN KEY (`playerId`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_player_votes`
--

LOCK TABLES `match_player_votes` WRITE;
/*!40000 ALTER TABLE `match_player_votes` DISABLE KEYS */;
INSERT INTO `match_player_votes` VALUES (1,18,1,'seed-voter-0001','2026-05-19 20:39:10','2026-05-19 20:39:10'),(2,18,3,'seed-voter-0002','2026-05-19 20:39:10','2026-05-19 20:39:10'),(3,18,9,'seed-voter-0003','2026-05-19 20:39:10','2026-05-19 20:39:10');
/*!40000 ALTER TABLE `match_player_votes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `seasonId` int unsigned NOT NULL,
  `homeTeamId` int unsigned NOT NULL,
  `awayTeamId` int unsigned NOT NULL,
  `homeScore` int unsigned NOT NULL,
  `awayScore` int unsigned NOT NULL,
  `winnerTeamId` int unsigned DEFAULT NULL,
  `matchNumber` int unsigned NOT NULL,
  `playedAt` datetime NOT NULL,
  `startedAt` datetime DEFAULT NULL,
  `endedAt` datetime DEFAULT NULL,
  `status` enum('played','cancelled') NOT NULL DEFAULT 'played',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `votingEnabled` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `matches_season_id_match_number` (`seasonId`,`matchNumber`),
  KEY `homeTeamId` (`homeTeamId`),
  KEY `awayTeamId` (`awayTeamId`),
  KEY `winnerTeamId` (`winnerTeamId`),
  CONSTRAINT `matches_ibfk_29` FOREIGN KEY (`seasonId`) REFERENCES `seasons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `matches_ibfk_30` FOREIGN KEY (`homeTeamId`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `matches_ibfk_31` FOREIGN KEY (`awayTeamId`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `matches_ibfk_32` FOREIGN KEY (`winnerTeamId`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
INSERT INTO `matches` VALUES (1,1,1,2,6,3,1,1,'2026-04-13 20:39:10','2026-04-13 19:24:10','2026-04-13 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(2,1,2,1,5,7,1,2,'2026-04-15 20:39:10','2026-04-15 19:24:10','2026-04-15 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(3,1,1,2,4,2,1,3,'2026-04-17 20:39:10','2026-04-17 19:24:10','2026-04-17 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(4,1,2,1,3,5,1,4,'2026-04-19 20:39:10','2026-04-19 19:24:10','2026-04-19 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(5,1,1,2,8,6,1,5,'2026-04-21 20:39:10','2026-04-21 19:24:10','2026-04-21 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(6,1,2,1,7,4,2,6,'2026-04-23 20:39:10','2026-04-23 19:24:10','2026-04-23 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(7,1,1,2,5,4,1,7,'2026-04-25 20:39:10','2026-04-25 19:24:10','2026-04-25 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(8,1,2,1,2,4,1,8,'2026-04-27 20:39:10','2026-04-27 19:24:10','2026-04-27 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(9,1,1,2,9,5,1,9,'2026-04-29 20:39:10','2026-04-29 19:24:10','2026-04-29 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(10,1,2,1,8,6,2,10,'2026-05-01 20:39:10','2026-05-01 19:24:10','2026-05-01 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(11,1,1,2,7,5,1,11,'2026-05-03 20:39:10','2026-05-03 19:24:10','2026-05-03 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(12,1,2,1,6,4,2,12,'2026-05-05 20:39:10','2026-05-05 19:24:10','2026-05-05 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(13,1,1,2,5,3,1,13,'2026-05-07 20:39:10','2026-05-07 19:24:10','2026-05-07 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(14,1,2,1,4,3,2,14,'2026-05-09 20:39:10','2026-05-09 19:24:10','2026-05-09 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(15,1,1,2,6,2,1,15,'2026-05-11 20:39:10','2026-05-11 19:24:10','2026-05-11 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(16,1,2,1,7,4,2,16,'2026-05-13 20:39:10','2026-05-13 19:24:10','2026-05-13 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(17,1,1,2,5,4,1,17,'2026-05-15 20:39:10','2026-05-15 19:24:10','2026-05-15 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(18,1,1,2,6,5,1,18,'2026-05-17 20:39:10','2026-05-17 19:24:10','2026-05-17 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(19,3,5,6,5,3,5,1,'2026-04-07 20:39:10','2026-04-07 19:29:10','2026-04-07 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(20,3,6,5,4,4,NULL,2,'2026-04-11 20:39:10','2026-04-11 19:29:10','2026-04-11 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(21,3,5,6,2,6,6,3,'2026-04-15 20:39:10','2026-04-15 19:29:10','2026-04-15 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(22,3,6,5,3,1,6,4,'2026-04-19 20:39:10','2026-04-19 19:29:10','2026-04-19 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(23,4,7,8,7,5,7,1,'2026-03-06 20:39:10','2026-03-06 19:29:10','2026-03-06 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(24,4,8,7,2,2,NULL,2,'2026-03-10 20:39:10','2026-03-10 19:29:10','2026-03-10 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1),(25,4,7,8,4,6,8,3,'2026-03-14 20:39:10','2026-03-14 19:29:10','2026-03-14 20:39:10','played','2026-05-19 20:39:10','2026-05-19 20:39:10',1);
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `next_matches`
--

DROP TABLE IF EXISTS `next_matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `next_matches` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `seasonId` int unsigned NOT NULL,
  `homeTeamId` int unsigned NOT NULL,
  `awayTeamId` int unsigned NOT NULL,
  `scheduledAt` datetime NOT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `note` text,
  `status` enum('scheduled','live','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `startedAt` datetime DEFAULT NULL,
  `endedAt` datetime DEFAULT NULL,
  `matchId` int unsigned DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `seasonId` (`seasonId`),
  KEY `homeTeamId` (`homeTeamId`),
  KEY `awayTeamId` (`awayTeamId`),
  KEY `matchId` (`matchId`),
  CONSTRAINT `next_matches_ibfk_29` FOREIGN KEY (`seasonId`) REFERENCES `seasons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `next_matches_ibfk_30` FOREIGN KEY (`homeTeamId`) REFERENCES `teams` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `next_matches_ibfk_31` FOREIGN KEY (`awayTeamId`) REFERENCES `teams` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `next_matches_ibfk_32` FOREIGN KEY (`matchId`) REFERENCES `matches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `next_matches`
--

LOCK TABLES `next_matches` WRITE;
/*!40000 ALTER TABLE `next_matches` DISABLE KEYS */;
INSERT INTO `next_matches` VALUES (1,2,3,4,'2026-05-21 15:00:00','City Arena','Prva utakmica Sezone 2. Crni: Pero, Kopra, Obrad, Vladimir, Sando i Srbo. Beli: Sone, Murinjo, Bojan, Micko, Makso i Dejvid.','live','2026-05-20 20:49:42',NULL,NULL,'2026-05-19 20:39:10','2026-05-20 20:49:42');
/*!40000 ALTER TABLE `next_matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_match_stats`
--

DROP TABLE IF EXISTS `player_match_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_match_stats` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `matchId` int unsigned NOT NULL,
  `playerId` int unsigned NOT NULL,
  `teamId` int unsigned NOT NULL,
  `goals` int unsigned NOT NULL DEFAULT '0',
  `assists` int unsigned NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `matchId` (`matchId`),
  KEY `playerId` (`playerId`),
  KEY `teamId` (`teamId`),
  CONSTRAINT `player_match_stats_ibfk_22` FOREIGN KEY (`matchId`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `player_match_stats_ibfk_23` FOREIGN KEY (`playerId`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `player_match_stats_ibfk_24` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_match_stats`
--

LOCK TABLES `player_match_stats` WRITE;
/*!40000 ALTER TABLE `player_match_stats` DISABLE KEYS */;
INSERT INTO `player_match_stats` VALUES (1,1,1,1,4,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(2,1,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(3,1,4,1,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(4,1,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(5,1,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(6,1,8,2,2,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(7,1,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(8,1,10,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(9,1,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(10,1,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(11,2,8,2,3,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(12,2,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(13,2,10,2,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(14,2,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(15,2,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(16,2,1,1,6,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(17,2,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(18,2,4,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(19,2,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(20,2,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(21,3,1,1,2,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(22,3,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(23,3,4,1,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(24,3,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(25,3,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(26,3,8,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(27,3,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(28,3,10,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(29,3,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(30,3,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(31,4,8,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(32,4,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(33,4,10,2,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(34,4,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(35,4,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(36,4,1,1,4,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(37,4,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(38,4,4,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(39,4,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(40,4,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(41,5,1,1,6,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(42,5,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(43,5,4,1,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(44,5,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(45,5,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(46,5,8,2,5,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(47,5,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(48,5,10,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(49,5,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(50,5,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(51,6,8,2,5,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(52,6,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(53,6,10,2,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(54,6,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(55,6,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(56,6,1,1,3,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(57,6,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(58,6,4,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(59,6,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(60,6,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(61,7,1,1,3,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(62,7,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(63,7,4,1,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(64,7,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(65,7,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(66,7,8,2,3,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(67,7,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(68,7,10,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(69,7,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(70,7,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(71,8,8,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(72,8,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(73,8,10,2,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(74,8,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(75,8,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(76,8,1,1,3,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(77,8,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(78,8,4,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(79,8,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(80,8,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(81,9,1,1,7,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(82,9,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(83,9,4,1,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(84,9,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(85,9,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(86,9,8,2,4,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(87,9,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(88,9,10,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(89,9,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(90,9,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(91,10,8,2,6,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(92,10,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(93,10,10,2,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(94,10,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(95,10,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(96,10,1,1,5,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(97,10,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(98,10,4,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(99,10,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(100,10,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(101,11,1,1,5,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(102,11,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(103,11,4,1,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(104,11,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(105,11,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(106,11,8,2,4,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(107,11,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(108,11,10,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(109,11,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(110,11,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(111,12,8,2,4,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(112,12,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(113,12,10,2,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(114,12,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(115,12,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(116,12,1,1,3,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(117,12,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(118,12,4,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(119,12,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(120,12,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(121,13,1,1,3,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(122,13,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(123,13,4,1,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(124,13,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(125,13,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(126,13,8,2,2,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(127,13,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(128,13,10,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(129,13,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(130,13,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(131,14,8,2,2,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(132,14,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(133,14,10,2,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(134,14,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(135,14,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(136,14,1,1,2,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(137,14,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(138,14,4,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(139,14,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(140,14,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(141,15,1,1,4,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(142,15,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(143,15,4,1,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(144,15,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(145,15,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(146,15,8,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(147,15,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(148,15,10,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(149,15,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(150,15,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(151,16,8,2,5,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(152,16,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(153,16,10,2,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(154,16,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(155,16,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(156,16,1,1,3,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(157,16,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(158,16,4,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(159,16,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(160,16,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(161,17,1,1,3,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(162,17,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(163,17,4,1,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(164,17,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(165,17,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(166,17,8,2,3,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(167,17,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(168,17,10,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(169,17,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(170,17,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(171,18,1,1,4,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(172,18,5,1,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(173,18,4,1,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(174,18,3,1,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(175,18,2,1,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(176,18,8,2,4,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(177,18,9,2,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(178,18,10,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(179,18,11,2,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(180,18,12,2,0,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(181,19,26,5,4,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(182,19,27,5,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(183,19,28,5,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(184,19,30,6,2,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(185,19,31,6,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(186,19,32,6,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(187,20,30,6,3,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(188,20,31,6,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(189,20,32,6,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(190,20,26,5,3,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(191,20,27,5,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(192,20,28,5,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(193,21,26,5,1,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(194,21,27,5,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(195,21,28,5,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(196,21,30,6,5,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(197,21,31,6,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(198,21,32,6,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(199,22,30,6,2,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(200,22,31,6,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(201,22,32,6,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(202,22,26,5,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(203,22,27,5,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(204,22,28,5,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(205,23,34,7,6,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(206,23,35,7,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(207,23,36,7,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(208,23,38,8,4,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(209,23,39,8,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(210,23,40,8,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(211,24,38,8,1,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(212,24,39,8,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(213,24,40,8,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(214,24,34,7,1,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(215,24,35,7,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(216,24,36,7,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(217,25,34,7,3,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(218,25,35,7,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(219,25,36,7,0,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(220,25,38,8,5,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(221,25,39,8,1,0,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(222,25,40,8,0,1,'2026-05-19 20:39:10','2026-05-19 20:39:10');
/*!40000 ALTER TABLE `player_match_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `position` enum('golman','igrac','golman-igrac') NOT NULL,
  `shirtNumber` int unsigned NOT NULL,
  `cardImageUrl` varchar(255) DEFAULT NULL,
  `galleryImages` json NOT NULL,
  `pac` int unsigned NOT NULL DEFAULT '50',
  `sho` int unsigned NOT NULL DEFAULT '50',
  `pas` int unsigned NOT NULL DEFAULT '50',
  `dri` int unsigned NOT NULL DEFAULT '50',
  `def` int unsigned NOT NULL DEFAULT '50',
  `phy` int unsigned NOT NULL DEFAULT '50',
  `overallRating` int unsigned NOT NULL DEFAULT '50',
  `goals` int unsigned NOT NULL DEFAULT '0',
  `assists` int unsigned NOT NULL DEFAULT '0',
  `showOnHome` tinyint(1) NOT NULL DEFAULT '0',
  `teamId` int unsigned NOT NULL,
  `seasonId` int unsigned NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `teamId` (`teamId`),
  KEY `seasonId` (`seasonId`),
  CONSTRAINT `players_ibfk_15` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `players_ibfk_16` FOREIGN KEY (`seasonId`) REFERENCES `seasons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (1,'Boris','Djukusic','Boki','golman-igrac',1,'/uploads/1779223465205-stock-2.png','[\"/player-assets/player-photo.svg?player=boris-djukusic&photo=1\", \"/player-assets/player-photo.svg?player=boris-djukusic&photo=2\", \"/uploads/1779223478007-vizuelni-prikaz.png\"]',78,74,81,79,72,84,78,70,0,0,1,1,'2026-05-19 20:39:10','2026-05-19 20:44:40'),(2,'Stefan','Nikolic',NULL,'igrac',5,'/player-assets/player-card.svg?player=stefan-nikolic','[\"/player-assets/player-photo.svg?player=stefan-nikolic&photo=1\", \"/player-assets/player-photo.svg?player=stefan-nikolic&photo=2\", \"/player-assets/player-photo.svg?player=stefan-nikolic&photo=3\"]',71,69,78,73,74,80,74,0,0,0,1,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(3,'Marko','Jovanovic','Maki','igrac',11,'/player-assets/player-card.svg?player=marko-jovanovic','[\"/player-assets/player-photo.svg?player=marko-jovanovic&photo=1\", \"/player-assets/player-photo.svg?player=marko-jovanovic&photo=2\", \"/player-assets/player-photo.svg?player=marko-jovanovic&photo=3\"]',88,79,76,87,52,74,76,0,18,0,1,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(4,'Vladimir','Peric','Vlado','igrac',10,'/player-assets/player-card.svg?player=vladimir-peric','[\"/player-assets/player-photo.svg?player=vladimir-peric&photo=1\", \"/player-assets/player-photo.svg?player=vladimir-peric&photo=2\", \"/player-assets/player-photo.svg?player=vladimir-peric&photo=3\"]',75,80,84,83,61,70,76,0,28,0,1,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(5,'Obrad','Pejic',NULL,'igrac',7,'/player-assets/player-card.svg?player=obrad-pejic','[\"/player-assets/player-photo.svg?player=obrad-pejic&photo=1\", \"/player-assets/player-photo.svg?player=obrad-pejic&photo=2\", \"/player-assets/player-photo.svg?player=obrad-pejic&photo=3\"]',82,77,70,76,58,73,73,18,0,0,1,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(6,'Luka','Stojanovic','Luks','igrac',8,'/player-assets/player-card.svg?player=luka-stojanovic','[\"/player-assets/player-photo.svg?player=luka-stojanovic&photo=1\", \"/player-assets/player-photo.svg?player=luka-stojanovic&photo=2\", \"/player-assets/player-photo.svg?player=luka-stojanovic&photo=3\"]',77,72,82,80,63,72,74,0,0,0,1,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(7,'Milos','Radovic',NULL,'golman',13,'/player-assets/player-card.svg?player=milos-radovic','[\"/player-assets/player-photo.svg?player=milos-radovic&photo=1\", \"/player-assets/player-photo.svg?player=milos-radovic&photo=2\", \"/player-assets/player-photo.svg?player=milos-radovic&photo=3\"]',58,44,63,61,84,83,66,0,0,0,1,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(8,'Nedeljko','Babic',NULL,'golman',12,'/player-assets/player-card.svg?player=nedeljko-babic','[\"/player-assets/player-photo.svg?player=nedeljko-babic&photo=1\", \"/player-assets/player-photo.svg?player=nedeljko-babic&photo=2\", \"/player-assets/player-photo.svg?player=nedeljko-babic&photo=3\"]',61,48,66,63,85,81,67,55,0,0,2,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(9,'David','Lejic','Daki','igrac',9,'/player-assets/player-card.svg?player=david-lejic','[\"/player-assets/player-photo.svg?player=david-lejic&photo=1\", \"/player-assets/player-photo.svg?player=david-lejic&photo=2\", \"/player-assets/player-photo.svg?player=david-lejic&photo=3\"]',86,82,73,85,55,76,76,18,0,0,2,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(10,'Aleksa','Kovacevic','Aki','igrac',6,'/player-assets/player-card.svg?player=aleksa-kovacevic','[\"/player-assets/player-photo.svg?player=aleksa-kovacevic&photo=1\", \"/player-assets/player-photo.svg?player=aleksa-kovacevic&photo=2\", \"/player-assets/player-photo.svg?player=aleksa-kovacevic&photo=3\"]',79,70,80,78,68,77,75,0,26,0,2,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(11,'Petar','Savic',NULL,'igrac',3,'/player-assets/player-card.svg?player=petar-savic','[\"/player-assets/player-photo.svg?player=petar-savic&photo=1\", \"/player-assets/player-photo.svg?player=petar-savic&photo=2\", \"/player-assets/player-photo.svg?player=petar-savic&photo=3\"]',73,66,74,70,81,82,74,0,18,0,2,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(12,'Filip','Matic','Fico','igrac',14,'/player-assets/player-card.svg?player=filip-matic','[\"/player-assets/player-photo.svg?player=filip-matic&photo=1\", \"/player-assets/player-photo.svg?player=filip-matic&photo=2\", \"/player-assets/player-photo.svg?player=filip-matic&photo=3\"]',84,75,71,82,56,75,74,0,0,0,2,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(13,'Nemanja','Ilic',NULL,'golman-igrac',2,'/player-assets/player-card.svg?player=nemanja-ilic','[\"/player-assets/player-photo.svg?player=nemanja-ilic&photo=1\", \"/player-assets/player-photo.svg?player=nemanja-ilic&photo=2\", \"/player-assets/player-photo.svg?player=nemanja-ilic&photo=3\"]',70,62,76,72,79,86,74,0,0,0,2,1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(14,'Petar','Perovic','Pero','igrac',4,'/player-assets/player-card.svg?player=s2-pero','[\"/player-assets/player-photo.svg?player=s2-pero&photo=1\", \"/player-assets/player-photo.svg?player=s2-pero&photo=2\", \"/player-assets/player-photo.svg?player=s2-pero&photo=3\"]',77,76,72,78,66,78,75,0,0,1,3,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(15,'Nikola','Koprivica','Kopra','golman-igrac',1,'/player-assets/player-card.svg?player=s2-kopra','[\"/player-assets/player-photo.svg?player=s2-kopra&photo=1\", \"/player-assets/player-photo.svg?player=s2-kopra&photo=2\", \"/player-assets/player-photo.svg?player=s2-kopra&photo=3\"]',72,67,79,74,80,84,76,0,0,1,3,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(16,'Obrad','Pejic','Obrad','igrac',7,'/player-assets/player-card.svg?player=s2-obrad','[\"/player-assets/player-photo.svg?player=s2-obrad&photo=1\", \"/player-assets/player-photo.svg?player=s2-obrad&photo=2\", \"/player-assets/player-photo.svg?player=s2-obrad&photo=3\"]',82,77,70,76,58,73,73,0,0,1,3,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(17,'Vladimir','Peric','Vladimir','igrac',10,'/player-assets/player-card.svg?player=s2-vladimir','[\"/player-assets/player-photo.svg?player=s2-vladimir&photo=1\", \"/player-assets/player-photo.svg?player=s2-vladimir&photo=2\", \"/player-assets/player-photo.svg?player=s2-vladimir&photo=3\"]',75,80,84,83,61,70,76,0,0,1,3,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(18,'Aleksandar','Sandic','Sando','igrac',8,'/player-assets/player-card.svg?player=s2-sando','[\"/player-assets/player-photo.svg?player=s2-sando&photo=1\", \"/player-assets/player-photo.svg?player=s2-sando&photo=2\", \"/player-assets/player-photo.svg?player=s2-sando&photo=3\"]',80,74,78,81,64,76,76,0,0,0,3,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(19,'Srdjan','Srbovic','Srbo','golman',12,'/player-assets/player-card.svg?player=s2-srbo','[\"/player-assets/player-photo.svg?player=s2-srbo&photo=1\", \"/player-assets/player-photo.svg?player=s2-srbo&photo=2\", \"/player-assets/player-photo.svg?player=s2-srbo&photo=3\"]',60,45,65,62,86,83,67,0,0,0,3,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(20,'Slobodan','Jovanovic','Sone','igrac',11,'/player-assets/player-card.svg?player=s2-sone','[\"/player-assets/player-photo.svg?player=s2-sone&photo=1\", \"/player-assets/player-photo.svg?player=s2-sone&photo=2\", \"/player-assets/player-photo.svg?player=s2-sone&photo=3\"]',84,79,77,85,57,75,76,0,0,1,4,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(21,'Milan','Murinjo','Murinjo','golman-igrac',2,'/player-assets/player-card.svg?player=s2-murinjo','[\"/player-assets/player-photo.svg?player=s2-murinjo&photo=1\", \"/player-assets/player-photo.svg?player=s2-murinjo&photo=2\", \"/player-assets/player-photo.svg?player=s2-murinjo&photo=3\"]',71,65,82,73,79,86,76,0,0,1,4,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(22,'Bojan','Radovic','Bojan','igrac',6,'/player-assets/player-card.svg?player=s2-bojan','[\"/player-assets/player-photo.svg?player=s2-bojan&photo=1\", \"/player-assets/player-photo.svg?player=s2-bojan&photo=2\", \"/player-assets/player-photo.svg?player=s2-bojan&photo=3\"]',78,76,80,79,68,77,76,0,0,1,4,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(23,'Mihailo','Mickovic','Micko','igrac',5,'/player-assets/player-card.svg?player=s2-micko','[\"/player-assets/player-photo.svg?player=s2-micko&photo=1\", \"/player-assets/player-photo.svg?player=s2-micko&photo=2\", \"/player-assets/player-photo.svg?player=s2-micko&photo=3\"]',74,70,76,72,81,80,76,0,0,1,4,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(24,'Maksim','Maksimovic','Makso','igrac',9,'/player-assets/player-card.svg?player=s2-makso','[\"/player-assets/player-photo.svg?player=s2-makso&photo=1\", \"/player-assets/player-photo.svg?player=s2-makso&photo=2\", \"/player-assets/player-photo.svg?player=s2-makso&photo=3\"]',86,82,73,84,55,77,76,0,0,0,4,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(25,'David','Lejic','Dejvid','igrac',14,'/player-assets/player-card.svg?player=s2-dejvid','[\"/player-assets/player-photo.svg?player=s2-dejvid&photo=1\", \"/player-assets/player-photo.svg?player=s2-dejvid&photo=2\", \"/player-assets/player-photo.svg?player=s2-dejvid&photo=3\"]',86,82,73,85,55,76,76,0,0,0,4,2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(26,'Amar','Hodzic','Amo','igrac',7,'/player-assets/player-card.svg?player=3-amar-hodzic','[\"/player-assets/player-photo.svg?player=3-amar-hodzic&photo=1\", \"/player-assets/player-photo.svg?player=3-amar-hodzic&photo=2\", \"/player-assets/player-photo.svg?player=3-amar-hodzic&photo=3\"]',81,78,76,82,58,74,75,8,4,0,5,3,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(27,'Dusan','Maric',NULL,'golman',1,'/player-assets/player-card.svg?player=3-dusan-maric','[\"/player-assets/player-photo.svg?player=3-dusan-maric&photo=1\", \"/player-assets/player-photo.svg?player=3-dusan-maric&photo=2\", \"/player-assets/player-photo.svg?player=3-dusan-maric&photo=3\"]',62,45,68,64,84,82,68,4,0,0,5,3,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(28,'Ivan','Knezevic',NULL,'igrac',10,'/player-assets/player-card.svg?player=3-ivan-knezevic','[\"/player-assets/player-photo.svg?player=3-ivan-knezevic&photo=1\", \"/player-assets/player-photo.svg?player=3-ivan-knezevic&photo=2\", \"/player-assets/player-photo.svg?player=3-ivan-knezevic&photo=3\"]',76,82,80,79,60,72,75,0,6,0,5,3,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(29,'Nikola','Vukovic','Niko','igrac',4,'/player-assets/player-card.svg?player=3-nikola-vukovic','[\"/player-assets/player-photo.svg?player=3-nikola-vukovic&photo=1\", \"/player-assets/player-photo.svg?player=3-nikola-vukovic&photo=2\", \"/player-assets/player-photo.svg?player=3-nikola-vukovic&photo=3\"]',72,68,73,70,80,78,74,0,0,0,5,3,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(30,'Sergej','Popovic',NULL,'igrac',11,'/player-assets/player-card.svg?player=3-sergej-popovic','[\"/player-assets/player-photo.svg?player=3-sergej-popovic&photo=1\", \"/player-assets/player-photo.svg?player=3-sergej-popovic&photo=2\", \"/player-assets/player-photo.svg?player=3-sergej-popovic&photo=3\"]',86,80,72,84,54,75,75,12,4,0,6,3,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(31,'Vasilije','Tomic','Vaso','golman-igrac',2,'/player-assets/player-card.svg?player=3-vasilije-tomic','[\"/player-assets/player-photo.svg?player=3-vasilije-tomic&photo=1\", \"/player-assets/player-photo.svg?player=3-vasilije-tomic&photo=2\", \"/player-assets/player-photo.svg?player=3-vasilije-tomic&photo=3\"]',70,63,77,73,78,85,74,4,0,0,6,3,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(32,'Andrej','Lazic',NULL,'igrac',8,'/player-assets/player-card.svg?player=3-andrej-lazic','[\"/player-assets/player-photo.svg?player=3-andrej-lazic&photo=1\", \"/player-assets/player-photo.svg?player=3-andrej-lazic&photo=2\", \"/player-assets/player-photo.svg?player=3-andrej-lazic&photo=3\"]',79,75,81,80,62,73,75,0,6,0,6,3,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(33,'Ognjen','Simic',NULL,'golman',12,'/player-assets/player-card.svg?player=3-ognjen-simic','[\"/player-assets/player-photo.svg?player=3-ognjen-simic&photo=1\", \"/player-assets/player-photo.svg?player=3-ognjen-simic&photo=2\", \"/player-assets/player-photo.svg?player=3-ognjen-simic&photo=3\"]',59,42,64,60,86,83,66,0,0,0,6,3,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(34,'Amar','Hodzic','Amo','igrac',7,'/player-assets/player-card.svg?player=4-amar-hodzic','[\"/player-assets/player-photo.svg?player=4-amar-hodzic&photo=1\", \"/player-assets/player-photo.svg?player=4-amar-hodzic&photo=2\", \"/player-assets/player-photo.svg?player=4-amar-hodzic&photo=3\"]',81,78,76,82,58,74,75,10,3,0,7,4,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(35,'Dusan','Maric',NULL,'golman',1,'/player-assets/player-card.svg?player=4-dusan-maric','[\"/player-assets/player-photo.svg?player=4-dusan-maric&photo=1\", \"/player-assets/player-photo.svg?player=4-dusan-maric&photo=2\", \"/player-assets/player-photo.svg?player=4-dusan-maric&photo=3\"]',62,45,68,64,84,82,68,3,0,0,7,4,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(36,'Ivan','Knezevic',NULL,'igrac',10,'/player-assets/player-card.svg?player=4-ivan-knezevic','[\"/player-assets/player-photo.svg?player=4-ivan-knezevic&photo=1\", \"/player-assets/player-photo.svg?player=4-ivan-knezevic&photo=2\", \"/player-assets/player-photo.svg?player=4-ivan-knezevic&photo=3\"]',76,82,80,79,60,72,75,0,5,0,7,4,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(37,'Nikola','Vukovic','Niko','igrac',4,'/player-assets/player-card.svg?player=4-nikola-vukovic','[\"/player-assets/player-photo.svg?player=4-nikola-vukovic&photo=1\", \"/player-assets/player-photo.svg?player=4-nikola-vukovic&photo=2\", \"/player-assets/player-photo.svg?player=4-nikola-vukovic&photo=3\"]',72,68,73,70,80,78,74,0,0,0,7,4,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(38,'Sergej','Popovic',NULL,'igrac',11,'/player-assets/player-card.svg?player=4-sergej-popovic','[\"/player-assets/player-photo.svg?player=4-sergej-popovic&photo=1\", \"/player-assets/player-photo.svg?player=4-sergej-popovic&photo=2\", \"/player-assets/player-photo.svg?player=4-sergej-popovic&photo=3\"]',86,80,72,84,54,75,75,10,3,0,8,4,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(39,'Vasilije','Tomic','Vaso','golman-igrac',2,'/player-assets/player-card.svg?player=4-vasilije-tomic','[\"/player-assets/player-photo.svg?player=4-vasilije-tomic&photo=1\", \"/player-assets/player-photo.svg?player=4-vasilije-tomic&photo=2\", \"/player-assets/player-photo.svg?player=4-vasilije-tomic&photo=3\"]',70,63,77,73,78,85,74,3,0,0,8,4,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(40,'Andrej','Lazic',NULL,'igrac',8,'/player-assets/player-card.svg?player=4-andrej-lazic','[\"/player-assets/player-photo.svg?player=4-andrej-lazic&photo=1\", \"/player-assets/player-photo.svg?player=4-andrej-lazic&photo=2\", \"/player-assets/player-photo.svg?player=4-andrej-lazic&photo=3\"]',79,75,81,80,62,73,75,0,4,0,8,4,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(41,'Ognjen','Simic',NULL,'golman',12,'/player-assets/player-card.svg?player=4-ognjen-simic','[\"/player-assets/player-photo.svg?player=4-ognjen-simic&photo=1\", \"/player-assets/player-photo.svg?player=4-ognjen-simic&photo=2\", \"/player-assets/player-photo.svg?player=4-ognjen-simic&photo=3\"]',59,42,64,60,86,83,66,0,0,0,8,4,'2026-05-19 20:39:10','2026-05-19 20:39:10');
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seasons`
--

DROP TABLE IF EXISTS `seasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasons` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `number` int unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `winsToWinSeason` int unsigned NOT NULL DEFAULT '8',
  `status` enum('active','completed') NOT NULL DEFAULT 'active',
  `winnerTeamId` int unsigned DEFAULT NULL,
  `startedAt` datetime NOT NULL,
  `finishedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `number` (`number`),
  UNIQUE KEY `number_2` (`number`),
  UNIQUE KEY `number_3` (`number`),
  UNIQUE KEY `number_4` (`number`),
  UNIQUE KEY `number_5` (`number`),
  UNIQUE KEY `number_6` (`number`),
  UNIQUE KEY `number_7` (`number`),
  UNIQUE KEY `number_8` (`number`),
  UNIQUE KEY `number_9` (`number`),
  KEY `winnerTeamId` (`winnerTeamId`),
  CONSTRAINT `seasons_ibfk_1` FOREIGN KEY (`winnerTeamId`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seasons`
--

LOCK TABLES `seasons` WRITE;
/*!40000 ALTER TABLE `seasons` DISABLE KEYS */;
INSERT INTO `seasons` VALUES (1,1,'Sezona 1: Bijeli vs Crni',13,'completed',1,'2026-05-19 20:39:10','2026-05-19 20:39:10','2026-05-19 20:39:10','2026-05-19 20:39:10'),(2,2,'Sezona 2: Crni vs Beli',13,'active',NULL,'2026-05-21 15:00:00',NULL,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(3,3,'Zimski Kup 2026',5,'completed',NULL,'2026-05-19 20:39:10','2026-04-07 20:39:10','2026-05-19 20:39:10','2026-05-19 20:39:10'),(4,4,'Ljetna Liga 2026',6,'completed',NULL,'2026-05-19 20:39:10','2026-03-06 20:39:10','2026-05-19 20:39:10','2026-05-19 20:39:10');
/*!40000 ALTER TABLE `seasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `shortName` varchar(4) NOT NULL,
  `logoUrl` varchar(255) DEFAULT NULL,
  `representativeName` varchar(255) DEFAULT NULL,
  `primaryColor` varchar(7) DEFAULT NULL,
  `seasonId` int unsigned NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teams_name_season_id` (`name`,`seasonId`),
  KEY `seasonId` (`seasonId`),
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`seasonId`) REFERENCES `seasons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'Bijeli','BIJ','/player-assets/player-card.svg?team=bijeli','Boris Djukusic','#F8FAFC',1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(2,'Crni','CRN','/player-assets/player-card.svg?team=crni','Nedeljko Babic','#020617',1,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(3,'Crni','CRN','/player-assets/player-card.svg?team=crni-s2','Petar Perovic','#020617',2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(4,'Beli','BEL','/player-assets/player-card.svg?team=beli-s2','Slobodan Jovanovic','#F8FAFC',2,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(5,'North Squad','NTH','/player-assets/player-card.svg?team=nth','Amar Hodzic','#14B8A6',3,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(6,'South Crew','STH','/player-assets/player-card.svg?team=sth','Sergej Popovic','#A855F7',3,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(7,'Orange Five','ORG','/player-assets/player-card.svg?team=org','Ivan Knezevic','#F97316',4,'2026-05-19 20:39:10','2026-05-19 20:39:10'),(8,'Green Wall','GRN','/player-assets/player-card.svg?team=grn','Vasilije Tomic','#22C55E',4,'2026-05-19 20:39:10','2026-05-19 20:39:10');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@football.com','$2b$10$bPFsXxYO20V4/pUObr831.MiD0yY2689cBGX.83ugAxjruZ4dYzeq','admin','2026-05-19 20:39:10','2026-05-19 20:39:10');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'football_faceoff'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-21  1:54:36
