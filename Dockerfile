FROM tomcat:10.1
COPY target/gamevault.war /usr/local/tomcat/webapps/
CMD ["catalina.sh", "run"]