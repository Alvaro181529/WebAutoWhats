# WebAutoWhats
## Descripción

Con esta aplicacion se realiza el envio de mensajes por whatsapp en tiempo real para ello se necesita una conexion a la base de datos la base de datos que se esta usando es mysql la cual sera usado para las las consultas en la base de datos
Por el momento la aplicaion solo ejecuta envio lunes, martes y miercoles 15:30 hrs
Para el reenvio se ejecuta jueves y viernes 15:30 hrs

## Requisitos

* Node.js 16.x
* NPM 8.x

## Autores

* Alvaro181529

## Versionado

Versión actual: 0.0.9

## Instalación

1. Clona el repositorio y ejecuta el siguiente comando
* `npm install`
2. Se instalaran las siguientes dependencias:
* `npm i crypto-js`
* `npm i express`
* `npm i moment`
* `npm i morgan`
* `npm i mysql2`
* `npm i node-cron`
* `npm i nodemon`
* `npm i pdfkit-table`
* `npm i puppeteer`
* `npm i qrcode`
* `npm i qrcode-terminal`
* `npm i rimraf`
* `npm i socket.io`
* `npm i whatsapp-web.js`
3. Para correr el proyecto:
* `npm tun dev`
* `npm tun start`

### Rango para el tiempo con node-cron

Aquí hay una referencia rápida al formato UNIX Cron que utiliza esta biblioteca, además de un segundo campo agregado:

```
field          allowed values
-----          --------------
second         0-59
minute         0-59
hour           0-23
day of month   1-31
month          1-12 (or names, see below)
day of week    0-7 (0 or 7 is Sunday, or use names)
```
