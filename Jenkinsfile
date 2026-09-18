pipeline {
    agent any

    parameters {
        choice(
            name: 'DEPLOY_ENV',
            choices: ['local', 'staging'],
            description: 'Deployment environment'
        )

        string(
            name: 'SERVER_PORT',
            defaultValue: '8081',
            description: 'Spring Boot server port'
        )
    }

    environment {
        NODE_HOME = '/Users/siddhanthmungekar/.nvm/versions/node/v25.6.1'
        PATH = "${NODE_HOME}/bin:/opt/homebrew/bin:${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Backend') {
            steps {
                sh 'mvn -f backend/pom.xml clean package -DskipTests'
            }
        }

        stage('Package') {
            steps {
                sh 'mkdir -p deployment'
                sh 'cp frontend/dist/* deployment/ || true'
                sh 'cp backend/target/*.jar deployment/'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    echo "Deploying to environment: ${DEPLOY_ENV}"
                    echo "Spring Boot port: ${SERVER_PORT}"

                    mkdir -p /opt/homebrew/var/www/subscription-portal
                    rm -rf /opt/homebrew/var/www/subscription-portal/*
                    cp -R frontend/dist/* /opt/homebrew/var/www/subscription-portal/

                    echo "Frontend deployed to Nginx"
                '''
            }
        }
    }

    post {
        success {
            echo 'Subscription Management Portal deployed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}
