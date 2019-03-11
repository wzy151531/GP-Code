# GP-Code
### 2019-02-14
1.change tcp-server to tls-server to encrypt the data<br>
2.add log.txt in NodeJs to record the info that accepted by server<br>
3.add ADMIN client to manage other clients<br>
4.repair the problem caused by the connection order of TEST-CLIENT and ADMIN<br>
5.repair the problem that makes server break down caused by the compulsive shutdown of any connection<br>
### 2019-02-15
1.update openssl<br>
2.add the ADMIN's authorization<br>
3.repair the problem that log.txt has been covered caused by the server's breakdown<br>
### 2019-02-16
1.add ADMIN command password for the request of managing other clients(code maybe confused because of the unknown problem of windows that the Windows PowerShell only can send request once)<br>
### 2019-02-17
1.repair the constant listen of ADMIN password<br>
2.tidying up code(the problem that ADMIN only can send info once has been solved through adding the request command in the code of ADMIN directly)<br>
3.merge the sockets array and clientsInfo array<br>
4.add the judge of ADMIN's command for void client<br>
5.add interval in each command of ADMIN(to simulate multiple times of ADMIN's commands)<br>
### 2019-02-24
1.use 'npm-init' to add package.json<br>
### 2019-03-11
1.complete uart to wifi function and tested with 8 byte(F9 00 04 00 00 00 0D F9)<br>
2.complete the function that extracts characteristic value from finger to server(207 byte)<br> 