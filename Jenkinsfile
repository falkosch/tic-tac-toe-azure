pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    preserveStashes(buildCount: 3)
    skipStagesAfterUnstable()
    timeout(time: 1, unit: 'HOURS')
  }

  triggers {
    pollSCM('H */15 * * *')
  }

  environment {
    CI = true
    HOME = "${env.WORKSPACE}"
  }

  stages {
    stage('build client') {
      agent {
        dockerfile {
          filename './Dockerfile.build'
          dir './tic-tac-toe-client'
          label 'docker && linux'
        }
      }

      environment {
        // Will be evaluated once the stage runs on the requested
        // "docker && linux" agent, otherwise HOME may have the already
        // evaluated value from the "pipeline" level, which could be a Windows
        // path if the master runs on that OS.
        HOME = "${env.WORKSPACE}"
      }

      stages {
        stage('checkout') {
          steps {
            dir('tic-tac-toe-client') {
              sh 'npm ci'
              sh 'npm run clean'
            }
          }
        }

        stage('validation') {
          steps {
            dir('tic-tac-toe-client') {
              sh 'npm run lint'
              sh 'npm run test:ci'
            }
          }
        }

        stage('collect reports') {
          steps {
            dir('tic-tac-toe-client') {
              junit 'reports/junit-*.xml'

              cobertura([
                coberturaReportFile: 'coverage/cobertura-coverage.xml',
                conditionalCoverageTargets: '0, 0, 0',
                enableNewApi: true,
                lineCoverageTargets: '0, 0, 0',
                maxNumberOfBuilds: 0,
                methodCoverageTargets: '0, 0, 0',
                onlyStable: false,
                sourceEncoding: 'ASCII'
              ])
            }
          }
        }

        stage('sonar quality gate') {
          steps {
            dir('tic-tac-toe-client') {
              lock(resource: 'sonarcloud-tic-tac-toe') {
                withSonarQubeEnv('sonarqube') {
                  withEnv(["sonar.branch.name=${env.BRANCH_NAME}"]) {
                    sh 'npm run analyze'
                  }
                }

                sleep time: 20, unit: 'SECONDS'

                timeout(time: 1, unit: 'MINUTES') {
                  waitForQualityGate abortPipeline: true
                }
              }
            }
          }
        }

        stage('build') {
          steps {
            dir('tic-tac-toe-client') {
              milestone(3)
              sh 'npm run build'
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
                  lock(resource: 'deploy-tic-tac-toe') {
                    milestone(11)

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
                    ) // sshPublisher
                  } // deploy-tic-tac-toe
                } // tic-tac-toe-client
              }
            } // Deploy to production
          }
        } // deploy
      }
    } // build client
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
