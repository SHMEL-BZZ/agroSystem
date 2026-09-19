--
-- PostgreSQL database dump
--

\restrict gpcibb1sdKB0sb8yTYsamNCGgUS5y9fnREou4hHmVmtStDoDgHQ7OyBJjmJiN2n

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

-- Started on 2026-09-16 10:14:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4986 (class 0 OID 25222)
-- Dependencies: 224
-- Data for Name: назначение_баков; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."назначение_баков" VALUES (1, 'Чистая вода');
INSERT INTO public."назначение_баков" VALUES (2, 'Питательный раствор');
INSERT INTO public."назначение_баков" VALUES (3, 'Дренажная вода');


--
-- TOC entry 4988 (class 0 OID 25229)
-- Dependencies: 226
-- Data for Name: баки; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."баки" VALUES (1, 1000.00, 1);
INSERT INTO public."баки" VALUES (2, 800.00, 2);
INSERT INTO public."баки" VALUES (3, 500.00, 3);


--
-- TOC entry 4992 (class 0 OID 25255)
-- Dependencies: 230
-- Data for Name: добавки; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."добавки" VALUES (1, 'Кальциевая селитра', 50.00, 'кг');
INSERT INTO public."добавки" VALUES (2, 'Калийная селитра', 35.00, 'кг');
INSERT INTO public."добавки" VALUES (3, 'Сульфат магния', 25.00, 'кг');
INSERT INTO public."добавки" VALUES (4, 'Ортофосфорная кислота', 20.00, 'л');
INSERT INTO public."добавки" VALUES (5, 'Комплексное удобрение 10-10-10', 100.00, 'кг');
INSERT INTO public."добавки" VALUES (6, 'Железный хелат', 5.00, 'кг');


--
-- TOC entry 4983 (class 0 OID 25197)
-- Dependencies: 221
-- Data for Name: клапаны; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."клапаны" VALUES (1, 'Hunter', 'PGV-101', 'электромагнитный', 25.40, 'работает');
INSERT INTO public."клапаны" VALUES (2, 'Netafim', 'Шаровый 1"', 'шаровый', 50.80, 'работает');
INSERT INTO public."клапаны" VALUES (3, 'Rain Bird', 'HV-100', 'электромагнитный', 25.40, 'работает');
INSERT INTO public."клапаны" VALUES (4, 'Hunter', 'PGV-201', 'электромагнитный', 32.00, 'работает');
INSERT INTO public."клапаны" VALUES (5, 'Netafim', 'Дисковый 2"', 'дисковый', 63.50, 'отключен');


--
-- TOC entry 4990 (class 0 OID 25241)
-- Dependencies: 228
-- Data for Name: ежедневные_условия; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."ежедневные_условия" VALUES (1, 1, '2026-09-01', 26.50, 'солнечно', 55.00, 2.10, 6.30);
INSERT INTO public."ежедневные_условия" VALUES (2, 1, '2026-09-02', 24.00, 'облачно', 65.00, 2.00, 6.40);
INSERT INTO public."ежедневные_условия" VALUES (3, 1, '2026-09-03', 28.00, 'солнечно', 50.00, 2.20, 6.20);
INSERT INTO public."ежедневные_условия" VALUES (4, 1, '2026-09-04', 22.00, 'дождь', 75.00, 1.80, 6.50);
INSERT INTO public."ежедневные_условия" VALUES (5, 1, '2026-09-05', 27.00, 'солнечно', 52.00, 2.30, 6.10);
INSERT INTO public."ежедневные_условия" VALUES (6, 2, '2026-09-01', 27.00, 'солнечно', 58.00, 1.90, 6.40);
INSERT INTO public."ежедневные_условия" VALUES (7, 2, '2026-09-02', 25.00, 'облачно', 68.00, 1.80, 6.50);
INSERT INTO public."ежедневные_условия" VALUES (8, 2, '2026-09-03', 29.00, 'солнечно', 53.00, 2.00, 6.30);
INSERT INTO public."ежедневные_условия" VALUES (9, 2, '2026-09-04', 23.00, 'дождь', 78.00, 1.60, 6.60);
INSERT INTO public."ежедневные_условия" VALUES (10, 2, '2026-09-05', 28.00, 'солнечно', 55.00, 2.10, 6.20);
INSERT INTO public."ежедневные_условия" VALUES (11, 1, '2026-09-07', 27.80, 'солнечно', 54.70, 2.59, 6.38);
INSERT INTO public."ежедневные_условия" VALUES (12, 2, '2026-09-07', 29.60, 'дождь', 59.40, 2.34, 6.53);
INSERT INTO public."ежедневные_условия" VALUES (13, 3, '2026-09-07', 29.40, 'облачно', 71.30, 2.20, 6.15);
INSERT INTO public."ежедневные_условия" VALUES (14, 4, '2026-09-07', 25.60, 'солнечно', 66.00, 2.27, 6.17);


--
-- TOC entry 4994 (class 0 OID 25264)
-- Dependencies: 232
-- Data for Name: история_раствора; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."история_раствора" VALUES (1, 2, '2026-09-01 08:00:00', 500.00);
INSERT INTO public."история_раствора" VALUES (2, 2, '2026-09-02 09:30:00', 450.00);
INSERT INTO public."история_раствора" VALUES (3, 2, '2026-09-03 07:45:00', 600.00);
INSERT INTO public."история_раствора" VALUES (4, 2, '2026-09-04 08:15:00', 550.00);
INSERT INTO public."история_раствора" VALUES (5, 2, '2026-09-05 10:00:00', 400.00);


--
-- TOC entry 4996 (class 0 OID 25297)
-- Dependencies: 234
-- Data for Name: история_поливов; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."история_поливов" VALUES (1, 1, 1, '2026-09-01 08:00:00', 1800, 150.00);
INSERT INTO public."история_поливов" VALUES (2, 3, 2, '2026-09-03 09:00:00', 1200, 100.00);
INSERT INTO public."история_поливов" VALUES (3, 5, 3, '2026-09-05 07:30:00', 1800, 150.00);
INSERT INTO public."история_поливов" VALUES (4, 6, 1, '2026-09-01 10:00:00', 2400, 200.00);
INSERT INTO public."история_поливов" VALUES (5, 8, 4, '2026-09-03 11:00:00', 1800, 150.00);
INSERT INTO public."история_поливов" VALUES (6, 10, 5, '2026-09-05 08:00:00', 1500, 125.00);
INSERT INTO public."история_поливов" VALUES (7, 2, 2, '2026-09-02 08:30:00', 1800, 100.00);
INSERT INTO public."история_поливов" VALUES (8, 5, 4, '2026-09-04 08:00:00', 1200, 100.00);


--
-- TOC entry 4998 (class 0 OID 25314)
-- Dependencies: 236
-- Data for Name: история_дренажа; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."история_дренажа" VALUES (28, 1, '2026-09-01 08:15:00', 15.00);
INSERT INTO public."история_дренажа" VALUES (29, 1, '2026-09-01 08:25:00', 10.00);
INSERT INTO public."история_дренажа" VALUES (30, 1, '2026-09-01 08:30:00', 8.00);
INSERT INTO public."история_дренажа" VALUES (31, 2, '2026-09-03 09:10:00', 12.00);
INSERT INTO public."история_дренажа" VALUES (32, 2, '2026-09-03 09:20:00', 8.00);
INSERT INTO public."история_дренажа" VALUES (33, 3, '2026-09-05 07:45:00', 18.00);
INSERT INTO public."история_дренажа" VALUES (34, 3, '2026-09-05 07:55:00', 12.00);
INSERT INTO public."история_дренажа" VALUES (35, 3, '2026-09-05 08:00:00', 5.00);
INSERT INTO public."история_дренажа" VALUES (36, 4, '2026-09-01 10:20:00', 20.00);
INSERT INTO public."история_дренажа" VALUES (37, 4, '2026-09-01 10:35:00', 15.00);
INSERT INTO public."история_дренажа" VALUES (38, 4, '2026-09-01 10:40:00', 10.00);
INSERT INTO public."история_дренажа" VALUES (39, 5, '2026-09-03 11:15:00', 14.00);
INSERT INTO public."история_дренажа" VALUES (40, 5, '2026-09-03 11:25:00', 10.00);
INSERT INTO public."история_дренажа" VALUES (41, 5, '2026-09-03 11:30:00', 6.00);
INSERT INTO public."история_дренажа" VALUES (42, 6, '2026-09-05 08:10:00', 16.00);
INSERT INTO public."история_дренажа" VALUES (43, 6, '2026-09-05 08:20:00', 10.00);
INSERT INTO public."история_дренажа" VALUES (44, 6, '2026-09-05 08:25:00', 8.00);
INSERT INTO public."история_дренажа" VALUES (45, 7, '2026-09-02 08:45:00', 10.00);
INSERT INTO public."история_дренажа" VALUES (46, 7, '2026-09-02 08:55:00', 8.00);
INSERT INTO public."история_дренажа" VALUES (47, 7, '2026-09-02 09:00:00', 5.00);
INSERT INTO public."история_дренажа" VALUES (50, 8, '2026-09-07 12:31:31.32559', 2.10);


--
-- TOC entry 4979 (class 0 OID 25179)
-- Dependencies: 217
-- Data for Name: пользователи; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."пользователи" VALUES (1, 'admin', 'admin123');
INSERT INTO public."пользователи" VALUES (2, 'agronom1', 'pass123');
INSERT INTO public."пользователи" VALUES (3, 'agronom2', 'pass456');
INSERT INTO public."пользователи" VALUES (4, 'operator', 'op789');
INSERT INTO public."пользователи" VALUES (5, 'director', 'dir321');
INSERT INTO public."пользователи" VALUES (6, 'test_user', '$2a$06$pcfm7CUG79HsV6deQpoAZ.yM6z/q7iw9nkPoD2YcoPkL2fP7spxK.');
INSERT INTO public."пользователи" VALUES (7, 'kate', '$2b$05$3wjYyFw.AVEG7JbABfdknevUBdhrJD72tuqqn.0mR0H92jPnWebJO');
INSERT INTO public."пользователи" VALUES (8, 'katertydyst', '$2b$05$hIIBGtU3fbRr6H8SwFWxLey2FkRyFQf3suTehwS10xvPsgHFQLuiS');
INSERT INTO public."пользователи" VALUES (9, 'hdshd', '$2b$05$0mSyfOYEhtcly.oHjx3h4u2bB7jBKbrBJ.cmtXtejxYeQW/R2NTSm');


--
-- TOC entry 5000 (class 0 OID 25340)
-- Dependencies: 238
-- Data for Name: состав_раствора; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."состав_раствора" VALUES (3, 1, 1, 10.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (4, 1, 2, 5.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (5, 1, 3, 3.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (6, 1, 4, 2.00, 'л');
INSERT INTO public."состав_раствора" VALUES (7, 2, 1, 8.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (8, 2, 2, 4.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (9, 2, 5, 10.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (10, 3, 1, 12.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (11, 3, 3, 4.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (12, 3, 4, 2.50, 'л');
INSERT INTO public."состав_раствора" VALUES (13, 3, 6, 1.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (14, 4, 2, 6.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (15, 4, 5, 15.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (16, 4, 6, 1.50, 'кг');
INSERT INTO public."состав_раствора" VALUES (17, 5, 1, 9.00, 'кг');
INSERT INTO public."состав_раствора" VALUES (18, 5, 3, 3.50, 'кг');
INSERT INTO public."состав_раствора" VALUES (19, 5, 4, 1.50, 'л');


--
-- TOC entry 4981 (class 0 OID 25188)
-- Dependencies: 219
-- Data for Name: список_блока_теплиц; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."список_блока_теплиц" VALUES (1, 'Блок А (Север)', 'Томаты - крупноплодные, сорт "Бычье сердце"');
INSERT INTO public."список_блока_теплиц" VALUES (2, 'Блок Б (Юг)', 'Огурцы - тепличный сорт "Конкурент"');
INSERT INTO public."список_блока_теплиц" VALUES (3, 'Блок В (Запад)', 'Перец сладкий "Калифорнийское чудо"');
INSERT INTO public."список_блока_теплиц" VALUES (4, 'Блок Г (Восток)', 'Баклажаны "Алмаз"');
INSERT INTO public."список_блока_теплиц" VALUES (5, 'Блок Д (Центр)', 'Зелень: укроп, петрушка, салат');


--
-- TOC entry 4984 (class 0 OID 25206)
-- Dependencies: 222
-- Data for Name: теплицы_клапаны; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."теплицы_клапаны" VALUES (1, 1);
INSERT INTO public."теплицы_клапаны" VALUES (2, 2);
INSERT INTO public."теплицы_клапаны" VALUES (3, 3);
INSERT INTO public."теплицы_клапаны" VALUES (4, 4);
INSERT INTO public."теплицы_клапаны" VALUES (3, 5);


--
-- TOC entry 5006 (class 0 OID 0)
-- Dependencies: 225
-- Name: баки_id_бака_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."баки_id_бака_seq"', 3, true);


--
-- TOC entry 5007 (class 0 OID 0)
-- Dependencies: 229
-- Name: добавки_id_добавка_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."добавки_id_добавка_seq"', 6, true);


--
-- TOC entry 5008 (class 0 OID 0)
-- Dependencies: 227
-- Name: ежедневные_условия_id_ежуслов_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ежедневные_условия_id_ежуслов_seq"', 34, true);


--
-- TOC entry 5009 (class 0 OID 0)
-- Dependencies: 235
-- Name: история_дренажа_id_дренажа_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."история_дренажа_id_дренажа_seq"', 50, true);


--
-- TOC entry 5010 (class 0 OID 0)
-- Dependencies: 233
-- Name: история_поливов_id_полива_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."история_поливов_id_полива_seq"', 7, true);


--
-- TOC entry 5011 (class 0 OID 0)
-- Dependencies: 231
-- Name: история_раствора_id_раствора_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."история_раствора_id_раствора_seq"', 5, true);


--
-- TOC entry 5012 (class 0 OID 0)
-- Dependencies: 220
-- Name: клапаны_id_клапана_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."клапаны_id_клапана_seq"', 5, true);


--
-- TOC entry 5013 (class 0 OID 0)
-- Dependencies: 223
-- Name: назначение_баков_id_назначения_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."назначение_баков_id_назначения_seq"', 3, true);


--
-- TOC entry 5014 (class 0 OID 0)
-- Dependencies: 216
-- Name: пользователи_id_пользователя_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."пользователи_id_пользователя_seq"', 9, true);


--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 237
-- Name: состав_раствора_id_состава_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."состав_раствора_id_состава_seq"', 20, true);


--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 218
-- Name: список_блока_тепл_id_блока_теплиц_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."список_блока_тепл_id_блока_теплиц_seq"', 5, true);


-- Completed on 2026-09-16 10:14:37

--
-- PostgreSQL database dump complete
--

\unrestrict gpcibb1sdKB0sb8yTYsamNCGgUS5y9fnREou4hHmVmtStDoDgHQ7OyBJjmJiN2n

