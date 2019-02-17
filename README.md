# GP-Code
### 2019-02-14
change tcp-server to tls-server to encrypt the data<br>
add log.txt in NodeJs to record the info that accepted by server<br>
add ADMIN client to manage other clients<br>
repair the problem caused by the connection order of TEST-CLIENT and ADMIN<br>
repair the problem that makes server break down caused by the compulsive shutdown of any connection<br>
### 2019-02-15
update openssl<br>
add the ADMIN's authorization<br>
repair the problem that log.txt has been covered caused by the server's breakdown<br>
### 2019-02-16
add ADMIN command password for the request of managing other clients(code maybe confused because of the unknown problem of windows that the Windows PowerShell only can send request once)<br>
### 2019-02-17
repair the constant listen of ADMIN password<br>
tidying up code(the problem that ADMIN only can send info once has been solved through adding the request command in the code of ADMIN directly)<br>
merge the sockets array and clientsInfo array<br>
add the judge of ADMIN's command for void client<br>
add interval in each command of ADMIN(to simulate multiple times of ADMIN's commands)<br>