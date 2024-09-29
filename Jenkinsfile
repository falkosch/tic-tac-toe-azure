pipeline {
  agent {
    docker {
      image 'atlassianlabs:docker-node-jdk-chrome-firefox:2019-12-30'
    }
  }
  options {
    disableConcurrentBuilds()
    skipStagesAfterUnstable()
    timeout(time: 1, unit: 'HOURS')
  }
  triggers {
    pollSCM('H */15 * * *')
  }
  stages {
    stage('build client') {
      stages {
        stage('build') {
          steps {
            dir('tic-tac-toe-client') {
              sh 'npm install'
              sh 'npm run lint'
              sh 'npm test'
            }
          }
        }
        stage('deploy') {
          when {
            expression {
              currentBuild.resultIsBetterOrEqualTo('SUCCESS')
            }
          }
          stages {
            stage('Deploy to production') {
              when {
                branch 'master'
              }
              steps {
                dir('tic-tac-toe-client') {
                  sh 'npm run build'
                  sshPublisher(
                    publishers: [
                      sshPublisherDesc(configName: 'Deploy to webserver', transfers: [
                        sshTransfer(
                          cleanRemote: true,
                          flatten: false,
                          makeEmptyDirs: true,
                          remoteDirectory: 'tictactoe',
                          sourceFiles: 'build/**/*',
                          removePrefix: 'build',
                          excludes: '*.map'
                        )
                      ])
                    ]
                  )
                }
              }
            }
          }
        }
      }
    }
  }
  post {
    failure {
      script {
        committerEmail = sh(returnStdout: true, script: 'git --no-pager show -s --format=\'%ae\'').trim()
      }
      mail(
        to: "${committerEmail}",
        subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
        body: "Something is wrong with ${env.BUILD_URL}"
      )
    }
  }
}
