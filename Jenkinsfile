node {
    stage('SCM Checkout') {
        git 'https://github.com/Maadhav3112/Gamevault-v1.2.0'
    }

    stage('Maven Build') {
        def mvnHome = tool name: 'Maven-3.9.16', type: 'maven'
        dir('backend') {
            sh "${mvnHome}/bin/mvn clean package"
        }
    }

    stage('SonarQube Analysis') {
        def mvn = tool name: 'Maven-3.9.16', type: 'maven'
        dir('backend') {
            withSonarQubeEnv('SonarQube') { // Recommended: specify Sonar server name configured in Jenkins
                sh "${mvn}/bin/mvn clean verify org.sonarsource.scanner.maven:sonar-maven-plugin:sonar -Dsonar.projectKey=gamevault -Dsonar.projectName='GameVault'"
            }
        }
    }

    stage('Build Docker Image') {
        sh 'docker build -t raiden004/gamevault:latest .'
    }

    stage('Trivy Security Scan') {
        timeout(time: 10, unit: 'MINUTES') {
            sh '''
                mkdir -p /var/lib/jenkins/trivy-cache
                trivy image --cache-dir /var/lib/jenkins/trivy-cache --severity HIGH,CRITICAL --ignore-unfixed --format json -o trivy-report.json raiden004/gamevault:latest
            '''
            archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: true
        }
    }

    stage('Docker Image Push') {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            // Secure login via stdin piping to prevent password leaks in logs
            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
            sh 'docker push raiden004/gamevault:latest'
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
                docker run -d --name tomcattest -p 8085:8080 \
                  -e DB_HOST="$DB_HOST" \
                  -e DB_NAME="$DB_NAME" \
                  -e DB_USERNAME="$DB_USER" \
                  -e DB_PASSWORD="$DB_PASSWORD" \
                  raiden004/gamevault:latest
            '''
        }
    }

    stage('Deploy Frontend') {
        sh '''
            pkill -9 -f "http.server 8081" || true
            cd frontend
            nohup python3 -m http.server 8081 > /tmp/frontend.log 2>&1 &
        '''
    }
}