# Site BDA de Mines Paris - Backend

Ce repo contient le code source du backend du site du BDA des Mines de Paris ([bda-minesparis.fr](https://bda-minesparis.fr))

Pour les membres du BDA et utilisateurs du site, se référer [au wiki](https://github.com/bda-mines-paris/.github/wiki/Utilisation-du-site)

Quelques liens pour développeurs :
- [Pour démarrer](doc/startup.md)
- [Infos spécifiques au backend](doc/manuel_dev.md)
- [Configuration du serveur à distance](https://github.com/bda-mines-paris/.github/wiki/D%C3%A9veloppement-du-site)

commande pour upload sur ec2:
pscp -r -i .\cleBDA.ppk ./* ec2-user@ec2-54-166-175-189.compute-1.amazonaws.com:/home/ec2-user