INSERT INTO "Channels" ("id", "name","description","createdAt","updatedAt") VALUES
(1, 'RedCherry',NULL,'2020-10-30 10:47:46','2020-10-30 10:47:46')
,(2, 'RichCrypto',NULL,'2020-10-30 10:51:48','2020-10-30 10:51:48')
,(3, 'DevilCrypto',NULL,'2020-11-04 18:18:33','2020-11-04 18:18:33')
,(4, 'TraidGood',NULL,'2020-11-05 08:23:34','2020-11-05 08:23:34')
;

INSERT INTO "Users" ("name","email","password","active","confirmedAt","role","createdAt","updatedAt") VALUES
('Demo User','demo@demo.example','cee768fde66334db.10000.48dab911bedfd0c7fa6c22703b28e55fe1de148a0cf330135ed372b3dd630a7efd1d9a31b1ffb133f924d7892f1c3127c7fba5d42edcdf1425c50778ce030aaeb50ad034574892941af905af931941cab2ffa740f12edd56c3ad9a6d5391d67fd357d97997a1658d2d877f8aedc12e4dc7c72160c089680ea71b4983189ebef3',TRUE,'2020-10-30 10:14:38','user','2020-10-30 10:14:38','2020-10-30 10:14:38')
,('Demo Paid User','demo-paid@demo.example','cee768fde66334db.10000.48dab911bedfd0c7fa6c22703b28e55fe1de148a0cf330135ed372b3dd630a7efd1d9a31b1ffb133f924d7892f1c3127c7fba5d42edcdf1425c50778ce030aaeb50ad034574892941af905af931941cab2ffa740f12edd56c3ad9a6d5391d67fd357d97997a1658d2d877f8aedc12e4dc7c72160c089680ea71b4983189ebef3',TRUE,'2020-10-30 10:14:38','paid user','2020-10-30 10:14:38','2020-10-30 10:14:38')
,('Demo Admin','admin@demo.example','cee768fde66334db.10000.48dab911bedfd0c7fa6c22703b28e55fe1de148a0cf330135ed372b3dd630a7efd1d9a31b1ffb133f924d7892f1c3127c7fba5d42edcdf1425c50778ce030aaeb50ad034574892941af905af931941cab2ffa740f12edd56c3ad9a6d5391d67fd357d97997a1658d2d877f8aedc12e4dc7c72160c089680ea71b4983189ebef3',TRUE,'2020-10-30 10:14:38','admin','2020-10-30 10:14:38','2020-10-30 10:14:38')
;

INSERT INTO "Signals" ("id", "userId","status","exitPrice","ticker","title","type","risk","term","volume","paid","commentable","price","remaining","createdAt","updatedAt","post","lastPrice","profitability","channelId") VALUES
(1, 3,'delayed',NULL,'BNBUSDT','BNB/USDT','long','medium','short',0.10000000,TRUE,TRUE,NULL,1.000,'2020-11-04 16:25:00','2020-11-05 06:47:30','Overall stop-loss - Overall stoploss at 137 (11%). You may move position stop-loss to trade entry price once Target 1 is done. And may move position stop loss to Target 1 once Target 2 is done. Keep moving stoploss accordingly.',NULL,0.00000000,1)
,(2, 3,'finished',NULL,'DCRUSDT','DCR/USDT','short','medium','short',0.05000000,TRUE,TRUE,13.25000000,0.000,'2020-11-05 16:25:00','2020-11-04 19:08:10','Overall stop-loss - Overall stoploss at 137 (11%). You may move position stop-loss to trade entry price once Target 1 is done. And may move position stop loss to Target 1 once Target 2 is done. Keep moving stoploss accordingly.',13.15000000,0.56925996,2)
,(3, 3,'active',NULL,'ETHUSDT','ETH/USDT','short','medium','short',0.05000000,TRUE,TRUE,0.00000000,1.000,'2020-11-06 16:25:00','2020-11-04 19:57:47','Overall stop-loss - Overall stoploss at 137 (11%). You may move position stop-loss to trade entry price once Target 1 is done. And may move position stop loss to Target 1 once Target 2 is done. Keep moving stoploss accordingly.',NULL,0.00000000,3)
,(4, 3,'finished',NULL,'AVAXUSDT','AVAX/USDT','long','low','long',0.00000000,FALSE,TRUE,3.19970000,0.000,'2020-11-04 18:18:33','2020-11-04 19:17:43','',3.18000000,-0.30315342,4)
,(5, 3,'finished',NULL,'BANDUSDT','BAND/USDT','short','low','long',0.00000000,FALSE,TRUE,4.04550000,0.000,'2020-11-04 18:23:09','2020-11-05 02:26:28','',4.04700000,-0.00346052,4)
,(6, 3,'delayed',NULL,'EOSUSDT','EOS/USDT','long','low','long',0.00000000,FALSE,TRUE,0.00000000,1.000,'2020-11-05 08:23:34','2020-11-05 08:25:06','',NULL,0.00000000,2)
;

INSERT INTO "EntryPoints" ("signalId","price","comment","createdAt","updatedAt","triggerPrice","triggerDate") VALUES
(1,13.25000000,NULL,'2020-11-04 17:28:29','2020-11-04 17:28:29',NULL,NULL)
,(2,3.19950000,'','2020-11-04 18:18:33','2020-11-04 18:18:33',NULL,NULL)
,(2,3.19970000,'','2020-11-04 18:18:33','2020-11-04 18:18:33',NULL,NULL)
,(3,4.04550000,'','2020-11-04 18:23:09','2020-11-04 18:23:09',NULL,NULL)
,(3,4.04500000,'','2020-11-04 18:23:09','2020-11-04 18:23:09',NULL,NULL)
,(4,397.00000000,'','2020-11-04 19:57:47','2020-11-04 19:57:47',NULL,NULL)
,(4,400.00000000,'','2020-11-04 19:57:47','2020-11-04 19:57:47',NULL,NULL)
,(5,26.00000000,'','2020-11-05 06:47:30','2020-11-05 06:47:30',NULL,NULL)
,(5,27.00000000,'','2020-11-05 06:47:30','2020-11-05 06:47:30',NULL,NULL)
,(6,2.38230000,'','2020-11-05 08:25:06','2020-11-05 08:25:06',NULL,NULL)
,(6,2.38430000,'','2020-11-05 08:25:06','2020-11-05 08:25:06',NULL,NULL)
;

INSERT INTO "Logs" ("level","message","meta","timestamp","createdAt","updatedAt") VALUES
('info','Activation: activating signal 1 by entry points 5 @ 10250 between price 10253.9 and last price 10242.31','{}','2020-10-30 10:49:16','2020-10-30 10:49:16','2020-10-30 10:49:16')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604054956505,"s":"YFIUSDT","t":8323959,"p":"10253.90000000","q":"0.00999400","b":193328933,"a":193328932,"T":1604054956504,"m":false,"M":true}','{}','2020-10-30 10:49:16','2020-10-30 10:49:16','2020-10-30 10:49:16')
,('info','Level trigger: for signal 1 levels triggered: 5@10300 between price 10300 and last price 10298.85','{}','2020-10-30 10:53:10','2020-10-30 10:53:10','2020-10-30 10:53:10')
,('info','Order 5 closed by full volume 0.4, signal 1 remaining: 0.6, signal last price: 10300, signal exit price: 4120, signal profitability: -59.80487804878049','{}','2020-10-30 10:53:10','2020-10-30 10:53:10','2020-10-30 10:53:10')
,('info','Level trigger: for signal 1 levels triggered: 6@10310 between price 10310.35 and last price 10303.11','{}','2020-10-30 10:53:10','2020-10-30 10:53:10','2020-10-30 10:53:10')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604055190032,"s":"YFIUSDT","t":8324237,"p":"10300.00000000","q":"0.08100000","b":193342734,"a":193337910,"T":1604055190030,"m":false,"M":true}','{}','2020-10-30 10:53:10','2020-10-30 10:53:10','2020-10-30 10:53:10')
,('info','Order 6 closed by full volume 0.4, signal 1 remaining: 0.19999999999999996, signal last price: 10310, signal exit price: 8244, signal profitability: -19.57073170731707','{}','2020-10-30 10:53:10','2020-10-30 10:53:10','2020-10-30 10:53:10')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604055190300,"s":"YFIUSDT","t":8324243,"p":"10310.35000000","q":"0.00971000","b":193342848,"a":193342809,"T":1604055190299,"m":false,"M":true}','{}','2020-10-30 10:53:10','2020-10-30 10:53:10','2020-10-30 10:53:10')
,('info','Level trigger: for signal 1 levels triggered: 7@10320 between price 10322.58 and last price 10316.19','{}','2020-10-30 10:53:10','2020-10-30 10:53:10','2020-10-30 10:53:10')
,('info','Order 7 closed by partial volume 0.19999999999999996, signal 1 remaining: 0, signal last price: 10320, signal exit price: 10308, signal profitability: 0.5658536585365859','{}','2020-10-30 10:53:10','2020-10-30 10:53:10','2020-10-30 10:53:10')
;
INSERT INTO "Logs" ("level","message","meta","timestamp","createdAt","updatedAt") VALUES
('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604055190675,"s":"YFIUSDT","t":8324251,"p":"10322.58000000","q":"0.01900000","b":193342943,"a":193212987,"T":1604055190674,"m":false,"M":true}','{}','2020-10-30 10:53:10','2020-10-30 10:53:10','2020-10-30 10:53:10')
,('info','Activation: activating signal 4 by entry points 19 @ 10 between price 9.994 and last price 10.002','{}','2020-10-30 11:10:26','2020-10-30 11:10:26','2020-10-30 11:10:26')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604056226145,"s":"BALUSDT","t":826604,"p":"9.99400000","q":"6.94000000","b":25966738,"a":25966743,"T":1604056226144,"m":true,"M":true}','{}','2020-10-30 11:10:26','2020-10-30 11:10:26','2020-10-30 11:10:26')
,('info','Activation: activating signal 2 by entry points 26 @ 31 between price 31 and last price 30.984','{}','2020-10-30 11:42:54','2020-10-30 11:42:54','2020-10-30 11:42:54')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604058174814,"s":"AAVEUSDT","t":295558,"p":"31.00000000","q":"15.00000000","b":4550639,"a":4209435,"T":1604058174812,"m":false,"M":true}','{}','2020-10-30 11:42:54','2020-10-30 11:42:54','2020-10-30 11:42:54')
,('info','Activation: activating signal 5 by entry points 22 @ 4.4 between price 4.4 and last price 4.3999','{}','2020-10-30 12:33:50','2020-10-30 12:33:50','2020-10-30 12:33:50')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604061230712,"s":"BANDUSDT","t":8760669,"p":"4.40000000","q":"33.70000000","b":221012921,"a":220923207,"T":1604061230710,"m":false,"M":true}','{}','2020-10-30 12:33:50','2020-10-30 12:33:50','2020-10-30 12:33:50')
,('info','Activation: activating signal 3 by entry points 32 @ 4.8 between price 4.8 and last price 4.798','{}','2020-10-31 09:46:43','2020-10-31 09:46:43','2020-10-31 09:46:43')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604137603858,"s":"ATOMUSDT","t":12518517,"p":"4.80000000","q":"2.60000000","b":172910826,"a":172043561,"T":1604137603857,"m":false,"M":true}','{}','2020-10-31 09:46:43','2020-10-31 09:46:43','2020-10-31 09:46:43')
,('info','Level trigger: for signal 5 levels triggered: 24@4.6 between price 4.6 and last price 4.5999','{}','2020-11-01 22:31:15','2020-11-01 22:31:15','2020-11-01 22:31:15')
;
INSERT INTO "Logs" ("level","message","meta","timestamp","createdAt","updatedAt") VALUES
('info','Order 24 closed by full volume 0.33, signal 5 remaining: 0.6699999999999999, signal last price: 4.6, signal exit price: 1.518, signal profitability: -65.5','{}','2020-11-01 22:31:15','2020-11-01 22:31:15','2020-11-01 22:31:15')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604269875014,"s":"BANDUSDT","t":8817964,"p":"4.60000000","q":"4.74000000","b":225628949,"a":224764518,"T":1604269875012,"m":false,"M":true}','{}','2020-11-01 22:31:15','2020-11-01 22:31:15','2020-11-01 22:31:15')
,('info','Level trigger: for signal 2 levels triggered: 40@32.8 between price 32.883 and last price 32.79','{}','2020-11-02 06:28:47','2020-11-02 06:28:47','2020-11-02 06:28:47')
,('info','Order 40 closed by full volume 0.5, signal 2 remaining: 0.5, signal last price: 32.8, signal exit price: 16.4, signal profitability: -47.0967741935484','{}','2020-11-02 06:28:47','2020-11-02 06:28:47','2020-11-02 06:28:47')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604298526999,"s":"AAVEUSDT","t":337035,"p":"32.88300000","q":"3.48200000","b":5497827,"a":5497791,"T":1604298526998,"m":false,"M":true}','{}','2020-11-02 06:28:47','2020-11-02 06:28:47','2020-11-02 06:28:47')
,('info','Level trigger: for signal 2 levels triggered: 41@32.7 between price 32.747 and last price 32.697','{}','2020-11-02 06:39:57','2020-11-02 06:39:57','2020-11-02 06:39:57')
,('info','Order 41 closed by partial volume 0.5, signal 2 remaining: 0, signal last price: 32.7, signal exit price: 32.75, signal profitability: 5.645161290322576','{}','2020-11-02 06:39:57','2020-11-02 06:39:57','2020-11-02 06:39:57')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604299197346,"s":"AAVEUSDT","t":337121,"p":"32.74700000","q":"6.00000000","b":5500356,"a":5500357,"T":1604299197342,"m":true,"M":true}','{}','2020-11-02 06:39:57','2020-11-02 06:39:57','2020-11-02 06:39:57')
,('info','Activation: activating signal 6 by entry points 35 @ 13700 between price 13700 and last price 13700.02','{}','2020-11-02 08:04:11','2020-11-02 08:04:11','2020-11-02 08:04:11')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604304251314,"s":"BTCUSDT","t":449343692,"p":"13700.00000000","q":"0.06036300","b":3483814323,"a":3484186425,"T":1604304251313,"m":true,"M":true}','{}','2020-11-02 08:04:11','2020-11-02 08:04:11','2020-11-02 08:04:11')
;
INSERT INTO "Logs" ("level","message","meta","timestamp","createdAt","updatedAt") VALUES
('info','Level trigger: for signal 4 levels triggered: 46@9.8 between price 9.789 and last price 9.821','{}','2020-11-02 08:26:02','2020-11-02 08:26:02','2020-11-02 08:26:02')
,('info','Order 46 closed by full volume 0.4, signal 4 remaining: 0.6, signal last price: 9.8, signal exit price: 3.9200000000000004, signal profitability: 155.10204081632654','{}','2020-11-02 08:26:02','2020-11-02 08:26:02','2020-11-02 08:26:02')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604305562375,"s":"BALUSDT","t":836320,"p":"9.78900000","q":"1.08500000","b":26876291,"a":26876357,"T":1604305561713,"m":true,"M":true}','{}','2020-11-02 08:26:02','2020-11-02 08:26:02','2020-11-02 08:26:02')
,('info','Level trigger: for signal 4 levels triggered: 47@9.75 between price 9.745 and last price 9.753','{}','2020-11-02 08:26:20','2020-11-02 08:26:20','2020-11-02 08:26:20')
,('info','Order 47 closed by full volume 0.4, signal 4 remaining: 0.19999999999999996, signal last price: 9.75, signal exit price: 7.82, signal profitability: 27.877237851662407','{}','2020-11-02 08:26:20','2020-11-02 08:26:20','2020-11-02 08:26:20')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604305580139,"s":"BALUSDT","t":836340,"p":"9.74500000","q":"1.53700000","b":26809940,"a":26876566,"T":1604305580137,"m":true,"M":true}','{}','2020-11-02 08:26:20','2020-11-02 08:26:20','2020-11-02 08:26:20')
,('info','Level trigger: for signal 6 levels triggered: 36@13600 between price 13600 and last price 13600.01','{}','2020-11-02 08:30:04','2020-11-02 08:30:04','2020-11-02 08:30:04')
,('info','Order 36 closed by full volume 0.34, signal 6 remaining: 0.6599999999999999, signal last price: 13600, signal exit price: 4624, signal profitability: 196.280276816609','{}','2020-11-02 08:30:04','2020-11-02 08:30:04','2020-11-02 08:30:04')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604305803488,"s":"BTCUSDT","t":449362856,"p":"13600.00000000","q":"0.00088200","b":3471330264,"a":3481760440,"T":1604305803428,"m":true,"M":true}','{}','2020-11-02 08:30:04','2020-11-02 08:30:04','2020-11-02 08:30:04')
,('info','Level trigger: for signal 4 levels triggered: 48@9.7 between price 9.7 and last price 9.702','{}','2020-11-02 08:36:12','2020-11-02 08:36:12','2020-11-02 08:36:12')
;
INSERT INTO "Logs" ("level","message","meta","timestamp","createdAt","updatedAt") VALUES
('info','Order 48 closed by partial volume 0.19999999999999996, signal 4 remaining: 0, signal last price: 9.7, signal exit price: 9.76, signal profitability: 2.4590163934426146','{}','2020-11-02 08:36:12','2020-11-02 08:36:12','2020-11-02 08:36:12')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604306171985,"s":"BALUSDT","t":836429,"p":"9.70000000","q":"19.40700000","b":26654166,"a":26881726,"T":1604306171982,"m":true,"M":true}','{}','2020-11-02 08:36:12','2020-11-02 08:36:12','2020-11-02 08:36:12')
,('info','Order 37 closed by full volume 0.33, signal 6 remaining: 0.3299999999999999, signal last price: 13500, signal exit price: 9079, signal profitability: 50.8976759555017','{}','2020-11-02 08:42:19','2020-11-02 08:42:19','2020-11-02 08:42:19')
,('info','Level trigger: for signal 6 levels triggered: 37@13500 between price 13500 and last price 13500.01','{}','2020-11-02 08:42:19','2020-11-02 08:42:19','2020-11-02 08:42:19')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604306539199,"s":"BTCUSDT","t":449388629,"p":"13500.00000000","q":"0.00075700","b":3469560664,"a":3484340354,"T":1604306539185,"m":true,"M":true}','{}','2020-11-02 08:42:19','2020-11-02 08:42:19','2020-11-02 08:42:19')
,('info','Order 38 closed by partial volume 0.3299999999999999, signal 6 remaining: 0, signal last price: 13300, signal exit price: 13468, signal profitability: 1.7226017226017243','{}','2020-11-02 12:40:18','2020-11-02 12:40:18','2020-11-02 12:40:18')
,('info','Level trigger: for signal 6 levels triggered: 38@13300 between price 13300 and last price 13300.01','{}','2020-11-02 12:40:18','2020-11-02 12:40:18','2020-11-02 12:40:18')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604320818311,"s":"BTCUSDT","t":449611596,"p":"13300.00000000","q":"0.10000000","b":3464536160,"a":3485324995,"T":1604320818305,"m":true,"M":true}','{}','2020-11-02 12:40:18','2020-11-02 12:40:18','2020-11-02 12:40:18')
,('info','Order 43 closed by full volume 0.8, signal 3 remaining: 0.19999999999999996, signal last price: 4.5, signal exit price: 3.6, signal profitability: 33.33333333333333','{}','2020-11-03 02:39:36','2020-11-03 02:39:36','2020-11-03 02:39:36')
,('info','Level trigger: for signal 3 levels triggered: 43@4.5 between price 4.5 and last price 4.504','{}','2020-11-03 02:39:36','2020-11-03 02:39:36','2020-11-03 02:39:36')
;
INSERT INTO "Logs" ("level","message","meta","timestamp","createdAt","updatedAt") VALUES
('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604371176448,"s":"ATOMUSDT","t":12610517,"p":"4.50000000","q":"2.22400000","b":172495075,"a":174728990,"T":1604371176446,"m":true,"M":true}','{}','2020-11-03 02:39:36','2020-11-03 02:39:36','2020-11-03 02:39:36')
,('info','Level trigger: for signal 3 levels triggered: 44@4.4 between price 4.4 and last price 4.402','{}','2020-11-03 03:10:54','2020-11-03 03:10:54','2020-11-03 03:10:54')
,('info','Order 44 closed by partial volume 0.19999999999999996, signal 3 remaining: 0, signal last price: 4.4, signal exit price: 4.48, signal profitability: 7.14285714285714','{}','2020-11-03 03:10:54','2020-11-03 03:10:54','2020-11-03 03:10:54')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604373054825,"s":"ATOMUSDT","t":12613465,"p":"4.40000000","q":"14.00000000","b":172217502,"a":174770391,"T":1604373054823,"m":true,"M":true}','{}','2020-11-03 03:10:54','2020-11-03 03:10:54','2020-11-03 03:10:54')
,('info','Activation: activating signal 7 by entry points 42 @ 378 between price 378 and last price 378.01','{}','2020-11-03 13:13:56','2020-11-03 13:13:56','2020-11-03 13:13:56')
,('info','Activation: activating signal 8 by entry points 43 @ 378 between price 378 and last price 378.01','{}','2020-11-03 13:13:56','2020-11-03 13:13:56','2020-11-03 13:13:56')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604409236754,"s":"ETHUSDT","t":201292014,"p":"378.00000000","q":"0.17894000","b":1954372531,"a":1955008293,"T":1604409236748,"m":true,"M":true}','{}','2020-11-03 13:13:56','2020-11-03 13:13:56','2020-11-03 13:13:56')
,('info','Level trigger: for signal 7 levels triggered: 54@380 between price 380 and last price 379.99','{}','2020-11-03 13:23:28','2020-11-03 13:23:28','2020-11-03 13:23:28')
,('info','Order 54 closed by full volume 0.5, signal 7 remaining: 0.5, signal last price: 380, signal exit price: 190, signal profitability: -49.735449735449734','{}','2020-11-03 13:23:28','2020-11-03 13:23:28','2020-11-03 13:23:28')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604409808183,"s":"ETHUSDT","t":201293542,"p":"380.00000000","q":"1.28610000","b":1955244956,"a":1955176089,"T":1604409808181,"m":false,"M":true}','{}','2020-11-03 13:23:28','2020-11-03 13:23:28','2020-11-03 13:23:28')
;
INSERT INTO "Logs" ("level","message","meta","timestamp","createdAt","updatedAt") VALUES
('info','Level trigger: for signal 7 levels triggered: 55@385 between price 385 and last price 384.99','{}','2020-11-03 22:35:59','2020-11-03 22:35:59','2020-11-03 22:35:59')
,('info','Order 55 closed by partial volume 0.5, signal 7 remaining: 0, signal last price: 385, signal exit price: 382.5, signal profitability: 1.1904761904761862','{}','2020-11-03 22:35:59','2020-11-03 22:35:59','2020-11-03 22:35:59')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604442959298,"s":"ETHUSDT","t":201379243,"p":"385.00000000","q":"1.00000000","b":1957056654,"a":1952571992,"T":1604442959288,"m":false,"M":true}','{}','2020-11-03 22:35:59','2020-11-03 22:35:59','2020-11-03 22:35:59')
,('info','Level trigger: for signal 8 levels triggered: 60@388 between price 388 and last price 387.99','{}','2020-11-03 22:42:12','2020-11-03 22:42:12','2020-11-03 22:42:12')
,('info','Order 60 closed by partial volume 1, signal 8 remaining: 0, signal last price: 388, signal exit price: 388, signal profitability: -2.577319587628868','{}','2020-11-03 22:42:12','2020-11-03 22:42:12','2020-11-03 22:42:12')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604443332143,"s":"ETHUSDT","t":201383821,"p":"388.00000000","q":"0.45000000","b":1957090407,"a":1951672295,"T":1604443332141,"m":false,"M":true}','{}','2020-11-03 22:42:12','2020-11-03 22:42:12','2020-11-03 22:42:12')
,('info','Order 26 closed by partial volume 0.67, signal 5 remaining: 0, signal last price: 3.9, signal exit price: 2.613, signal profitability: -40.613636363636374','{}','2020-11-04 14:20:57','2020-11-04 14:20:57','2020-11-04 14:20:57')
,('info','Level trigger: for signal 5 levels triggered: 26@3.9 between price 3.9 and last price 3.9003','{}','2020-11-04 14:20:57','2020-11-04 14:20:57','2020-11-04 14:20:57')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604499657394,"s":"BANDUSDT","t":8864131,"p":"3.90000000","q":"23.11000000","b":205121473,"a":231713984,"T":1604499657383,"m":true,"M":true}','{}','2020-11-04 14:20:57','2020-11-04 14:20:57','2020-11-04 14:20:57')
,('info','Activation: activating signal 17 by entry points 57 @ 400 between price 399.99 and last price 400.01','{}','2020-11-04 18:13:54','2020-11-04 18:13:54','2020-11-04 18:13:54')
;
INSERT INTO "Logs" ("level","message","meta","timestamp","createdAt","updatedAt") VALUES
('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604513634296,"s":"ETHUSDT","t":201714566,"p":"399.99000000","q":"6.13401000","b":1961952312,"a":1961952333,"T":1604513634295,"m":true,"M":true}','{}','2020-11-04 18:13:54','2020-11-04 18:13:54','2020-11-04 18:13:54')
,('info','Activation: activating signal 18 by entry points 59 @ 3.1997 between price 3.1988 and last price 3.2','{}','2020-11-04 18:49:28','2020-11-04 18:49:28','2020-11-04 18:49:28')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604515768566,"s":"AVAXUSDT","t":1182844,"p":"3.19880000","q":"50.01000000","b":33757841,"a":33757915,"T":1604515768564,"m":true,"M":true}','{}','2020-11-04 18:49:28','2020-11-04 18:49:28','2020-11-04 18:49:28')
,('info','Level trigger: for signal 18 levels triggered: 114@3.2 between price 3.2018 and last price 3.1952','{}','2020-11-04 18:50:56','2020-11-04 18:50:56','2020-11-04 18:50:56')
,('info','Order 114 closed by full volume 0.5, signal 18 remaining: 0.5, signal last price: 3.2, signal exit price: 1.6, signal profitability: -49.99531206050567','{}','2020-11-04 18:50:56','2020-11-04 18:50:56','2020-11-04 18:50:56')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604515856029,"s":"AVAXUSDT","t":1182850,"p":"3.20180000","q":"15.52000000","b":33758441,"a":33758440,"T":1604515856027,"m":false,"M":true}','{}','2020-11-04 18:50:56','2020-11-04 18:50:56','2020-11-04 18:50:56')
,('info','Activation: activating signal 16 by entry points 55 @ 13.25 between price 13.251 and last price 13.239','{}','2020-11-04 19:06:41','2020-11-04 19:06:41','2020-11-04 19:06:41')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604516800994,"s":"DCRUSDT","t":144453,"p":"13.25100000","q":"0.83800000","b":9786564,"a":9774522,"T":1604516800993,"m":false,"M":true}','{}','2020-11-04 19:06:41','2020-11-04 19:06:41','2020-11-04 19:06:41')
,('info','Level trigger: for signal 16 levels triggered: 106@13.2 between price 13.187 and last price 13.212','{}','2020-11-04 19:08:10','2020-11-04 19:08:10','2020-11-04 19:08:10')
,('info','Order 106 closed by full volume 0.5, signal 16 remaining: 0.5, signal last price: 13.2, signal exit price: 6.6, signal profitability: 100.75757575757578','{}','2020-11-04 19:08:10','2020-11-04 19:08:10','2020-11-04 19:08:10')
;
INSERT INTO "Logs" ("level","message","meta","timestamp","createdAt","updatedAt") VALUES
('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604516890237,"s":"DCRUSDT","t":144470,"p":"13.18700000","q":"0.90700000","b":9786763,"a":9786866,"T":1604516890235,"m":true,"M":true}','{}','2020-11-04 19:08:10','2020-11-04 19:08:10','2020-11-04 19:08:10')
,('info','Order 107 closed by partial volume 0.5, signal 16 remaining: 0, signal last price: 13.15, signal exit price: 13.175, signal profitability: 0.5692599620493288','{}','2020-11-04 19:08:10','2020-11-04 19:08:10','2020-11-04 19:08:10')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604516890237,"s":"DCRUSDT","t":144477,"p":"13.13600000","q":"0.91000000","b":9786804,"a":9786866,"T":1604516890235,"m":true,"M":true}','{}','2020-11-04 19:08:10','2020-11-04 19:08:10','2020-11-04 19:08:10')
,('info','Level trigger: for signal 16 levels triggered: 107@13.15 between price 13.136 and last price 13.152','{}','2020-11-04 19:08:10','2020-11-04 19:08:10','2020-11-04 19:08:10')
,('info','Level trigger: for signal 18 levels triggered: 116@3.18 between price 3.1762 and last price 3.1832','{}','2020-11-04 19:17:43','2020-11-04 19:17:43','2020-11-04 19:17:43')
,('info','Order 116 closed by partial volume 0.5, signal 18 remaining: 0, signal last price: 3.18, signal exit price: 3.1900000000000004, signal profitability: -0.3031534206331732','{}','2020-11-04 19:17:43','2020-11-04 19:17:43','2020-11-04 19:17:43')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604517463718,"s":"AVAXUSDT","t":1182905,"p":"3.17620000","q":"6.34000000","b":33769183,"a":33769197,"T":1604517463717,"m":true,"M":true}','{}','2020-11-04 19:17:43','2020-11-04 19:17:43','2020-11-04 19:17:43')
,('info','Activation: activating signal 19 by entry points 60 @ 4.0455 between price 4.0455 and last price 4.0475','{}','2020-11-05 02:26:19','2020-11-05 02:26:19','2020-11-05 02:26:19')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604543179507,"s":"BANDUSDT","t":8874596,"p":"4.04550000","q":"23.95000000","b":232826234,"a":232826249,"T":1604543179504,"m":true,"M":true}','{}','2020-11-05 02:26:19','2020-11-05 02:26:19','2020-11-05 02:26:19')
,('info','Level trigger: for signal 19 levels triggered: 117@4.043 between price 4.0418 and last price 4.0455','{}','2020-11-05 02:26:20','2020-11-05 02:26:20','2020-11-05 02:26:20')
;
INSERT INTO "Logs" ("level","message","meta","timestamp","createdAt","updatedAt") VALUES
('info','Order 117 closed by full volume 0.34, signal 19 remaining: 0.6599999999999999, signal last price: 4.043, signal exit price: 1.3746200000000002, signal profitability: 194.29951550246608','{}','2020-11-05 02:26:20','2020-11-05 02:26:20','2020-11-05 02:26:20')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604543180298,"s":"BANDUSDT","t":8874597,"p":"4.04180000","q":"23.95000000","b":232826278,"a":232826306,"T":1604543180294,"m":true,"M":true}','{}','2020-11-05 02:26:20','2020-11-05 02:26:20','2020-11-05 02:26:20')
,('info','Data frame processed successfully and it triggers changes (activation or level), binance data: {"e":"trade","E":1604543188087,"s":"BANDUSDT","t":8874603,"p":"4.04720000","q":"61.70000000","b":232826715,"a":232826693,"T":1604543188086,"m":false,"M":true}','{}','2020-11-05 02:26:28','2020-11-05 02:26:28','2020-11-05 02:26:28')
,('info','Level trigger: for signal 19 levels triggered: 120@4.047 between price 4.0472 and last price 4.0442','{}','2020-11-05 02:26:28','2020-11-05 02:26:28','2020-11-05 02:26:28')
,('info','Order 120 closed by partial volume 0.6599999999999999, signal 19 remaining: 0, signal last price: 4.047, signal exit price: 4.04564, signal profitability: -0.0034605155179390223','{}','2020-11-05 02:26:28','2020-11-05 02:26:28','2020-11-05 02:26:28')
;

INSERT INTO "Orders" ("signalId","price","volume","comment","type","closed","closedVolume","createdAt","updatedAt","triggerPrice","triggerDate") VALUES
(1,13.20000000,0.500,NULL,'take profit',TRUE,0.500,'2020-11-04 17:28:29','2020-11-04 19:08:10',NULL,NULL)
,(1,13.15000000,0.500,NULL,'take profit',TRUE,0.500,'2020-11-04 17:28:29','2020-11-04 19:08:10',NULL,NULL)
,(1,13.50000000,1.000,NULL,'stop loss',FALSE,NULL,'2020-11-04 17:28:29','2020-11-04 17:28:29',NULL,NULL)
,(2,3.20000000,0.500,'','take profit',TRUE,0.500,'2020-11-04 18:18:33','2020-11-04 18:50:56',NULL,NULL)
,(2,3.21000000,0.500,'','take profit',FALSE,NULL,'2020-11-04 18:18:33','2020-11-04 18:18:33',NULL,NULL)
,(2,3.18000000,1.000,'','stop loss',TRUE,0.500,'2020-11-04 18:18:33','2020-11-04 19:17:43',NULL,NULL)
,(3,4.04300000,0.340,'','take profit',TRUE,0.340,'2020-11-04 18:23:09','2020-11-05 02:26:20',NULL,NULL)
,(3,4.03300000,0.330,'','take profit',FALSE,NULL,'2020-11-04 18:23:09','2020-11-04 18:23:09',NULL,NULL)
,(3,4.01500000,0.330,'','take profit',FALSE,NULL,'2020-11-04 18:23:09','2020-11-04 18:23:09',NULL,NULL)
,(3,4.04700000,1.000,'','stop loss',TRUE,0.660,'2020-11-04 18:23:09','2020-11-05 02:26:28',NULL,NULL)
,(4,395.00000000,0.340,'','take profit',FALSE,NULL,'2020-11-04 19:57:47','2020-11-04 19:57:47',NULL,NULL)
,(4,390.00000000,0.330,'','take profit',FALSE,NULL,'2020-11-04 19:57:47','2020-11-04 19:57:47',NULL,NULL)
,(4,385.00000000,0.330,'','take profit',FALSE,NULL,'2020-11-04 19:57:47','2020-11-04 19:57:47',NULL,NULL)
,(4,410.00000000,0.500,'','stop loss',FALSE,NULL,'2020-11-04 19:57:47','2020-11-04 19:57:47',NULL,NULL)
,(4,415.00000000,0.500,'','stop loss',FALSE,NULL,'2020-11-04 19:57:47','2020-11-04 19:57:47',NULL,NULL)
,(5,27.50000000,0.500,'','take profit',FALSE,NULL,'2020-11-05 06:47:30','2020-11-05 06:47:30',NULL,NULL)
,(5,28.00000000,0.500,'','take profit',FALSE,NULL,'2020-11-05 06:47:30','2020-11-05 06:47:30',NULL,NULL)
,(5,25.00000000,1.000,'','stop loss',FALSE,NULL,'2020-11-05 06:47:30','2020-11-05 06:47:30',NULL,NULL)
,(6,2.38490000,0.340,'Стоп в БУ','take profit',FALSE,NULL,'2020-11-05 08:25:06','2020-11-05 08:25:06',NULL,NULL)
,(6,2.38550000,0.330,'Стоп В TP1','take profit',FALSE,NULL,'2020-11-05 08:25:06','2020-11-05 08:25:06',NULL,NULL)
,(6,2.38650000,0.330,'','take profit',FALSE,NULL,'2020-11-05 08:25:06','2020-11-05 08:25:06',NULL,NULL)
,(6,2.38000000,1.000,'','stop loss',FALSE,NULL,'2020-11-05 08:25:06','2020-11-05 08:25:06',NULL,NULL)
;
