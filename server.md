# server
## Infrastructure

### on-Premise
> 데스크탑부터 서버랙까지

### off-Premise (cloud)

#### global
##### aws
##### azure
##### gcp


#### korea
##### ncp
##### kakao i cloud
##### cloud z (sk c&c)


### hybrid cloud

## OS
### linux
#### debian 계열
##### debian
##### ubuntu
- window wsl2 연계로 shell에서 powershell을 powershell에서 shell을 사용할 수 있다. 
#### red hat 계열
##### centOS
#### 기타
##### alpine
- 경량화가 가장 큰 특징
- 기본적으로 다들 알파인 기반 이미지 가져다 얹는 방식이라서 순수 알파인 기반으로 처음부터 docker file을 작성하는 것은 굉장히 어렵다 (맞는 자료가 없어서 직접 해야하는데 직접 할 때랑 dockerfile이 실행될때랑 권한이 다르다...)


### window
#### window11
##### wsl2
###### ubuntu

### mac
#### macos

### mobile (제한됨)
#### android
#### ios
#### ipados

## container
> if old macos, use colima with qemu
### container
#### docker
#### containerd
### container ochestration
#### docker-compose
#### kubernetes

## webserver
### apache httpd
### nginx

## WAS
### spring (JAVA/kotlin)
### spring boot (JAVA/kotlin)
### django (python)
### node (js)
### ASP.NET (c#)

## DB
### redis (noSQL, on memory)
### rdbms
> 정규화가 필요한 자료
mysql, mariadb 등을 쓴다
### noSQL
> 보통 json형태의 자료를 쉽게 보관하는 mongoDB를 쓴다

## secure
### server
#### User privilege
- root 접근 제한
- sudo 권한 관리
- requiretty (local_access : tty, remote_access : pty)
#### firewall
- utf
- IPTables
### data transfer
#### TLS/SSL

## protocol
### http
#### http api
#### rest api
#### graphql
### ws
### ssh

