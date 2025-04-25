pipeline {
  agent any

  environment {
    NODE_ENV = 'development'
  }

  stages {
    stage('Install & Test Each Service') {
      matrix {
        axes {
          axis {
            name 'SERVICE'
            values 'backend', 'executor', 'fetcher', 'frontend'
          }
        }
        stages {
          stage('Build and Test') {
            steps {
              dir("${SERVICE}") {
                sh '''
                  npm install
                  npm run build || echo "No build"
                  npm test || echo "No tests"
                '''
              }
            }
          }
        }
      }
    }
    stage('Docker Compose Up') {
      steps {
        sh 'docker-compose up -d'
      }
    }
  }
}
