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

        stage('Start Backend') {
            steps {
                sh '''
                    echo "Starting Spring Boot backend..."

                    nohup java -jar backend/target/*.jar \
                        --server.port=${SERVER_PORT} \
                        > backend.log 2>&1 &

                    echo $! > backend.pid

                    echo "Waiting for backend..."

                    for i in {1..30}; do
                        if curl -s http://localhost:${SERVER_PORT}/api/subscriptions > /dev/null; then
                            echo "Backend is ready."
                            break
                        fi
                        sleep 2
                    done

                    curl -f http://localhost:${SERVER_PORT}/api/subscriptions
                '''
            }
        }

        stage('Selenium Tests') {
            steps {
                dir('tests') {
                    sh 'mvn clean test'
                }
            }

            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: 'tests/target/surefire-reports/*.xml'

                    archiveArtifacts(
                        artifacts: 'tests/target/screenshots/**/*',
                        allowEmptyArchive: true
                    )
                }
            }
        }

        stage('Package') {
            steps {
                sh '''
                    mkdir -p deployment

                    cp frontend/dist/* deployment/ || true

                    cp backend/target/*.jar deployment/
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                echo "Deploying to environment: ${DEPLOY_ENV}"
                echo "Spring Boot port: ${SERVER_PORT}"

                mkdir -p /opt/homebrew/var/www/subscription-portal

                rm -rf /opt/homebrew/var/www/subscription-portal/*

                cp -R frontend/dist/. \
                    /opt/homebrew/var/www/subscription-portal/

                echo "Frontend deployed to Nginx"
                '''
            }
        }
    }

    post {

        always {
            sh '''
                if [ -f backend.pid ]; then
                    kill $(cat backend.pid) 2>/dev/null || true
                fi
            '''
        }

        success {
            echo 'Subscription Management Portal deployed successfully.'
        }

        failure {
            echo 'Pipeline failed. Deployment was stopped.'
        }
    }
}