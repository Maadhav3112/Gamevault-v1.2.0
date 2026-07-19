node {

    stage('SCM Checkout') {
        git 'https://github.com/Maadhav3112/Gamevault-v1.2.0'
    }

    stage('Maven Build') {
        def mvnHome = tool name: 'Maven-3.9.16', type: 'maven'
        dir('backend') {
            sh "${mvnHome}/bin/mvn clean package"
            sh 'mv target/gamevault*.war target/gamevault.war'
        }
    }

    stage('SonarQube Analysis') {
        def mvn = tool 'Maven-3.9.16'
        dir('backend') {
            withSonarQubeEnv() {
                sh "${mvn}/bin/mvn clean verify org.sonarsource.scanner.maven:sonar-maven-plugin:sonar -Dsonar.projectKey=gamevault -Dsonar.projectName='GameVault'"
            }
        }
    }

    stage('build Docker Image') {
        sh 'docker build -t raiden004/gamevault .'
    }

    stage('Docker image push') {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'dockerhubusername', passwordVariable: 'dockerhubpassword')]) {
            sh "docker login -u $dockerhubusername -p ${dockerhubpassword}"
            sh 'docker push raiden004/gamevault'
        }
    }

    stage('Remove Previous Container') {
        sh '''
            docker stop tomcattest || true
            docker rm -f tomcattest || true
        '''
    }

    stage('Docker Deployment') {
        withCredentials([
            string(credentialsId: 'db-host', variable: 'DB_HOST'),
            string(credentialsId: 'db-name', variable: 'DB_NAME'),
            string(credentialsId: 'db-user', variable: 'DB_USER'),
            string(credentialsId: 'db-password', variable: 'DB_PASSWORD')
        ]) {
            sh '''
                docker pull raiden004/gamevault:latest
                docker run -d --name tomcattest -p 80:8080 \
                  -e DB_HOST=$DB_HOST \
                  -e DB_NAME=$DB_NAME \
                  -e DB_USER=$DB_USER \
                  -e DB_PASSWORD=$DB_PASSWORD \
                  raiden004/gamevault:latest
            '''
        }
    }
}