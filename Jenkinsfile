// Jenkins pipeline: same tests, run from Jenkins instead of GitHub Actions.
// Needs: NodeJS plugin (tool named 'node20'), HTML Publisher plugin, JUnit plugin.
pipeline {
  agent any
  tools { nodejs 'node20' }
  parameters {
    choice(name: 'SUITE', choices: ['@smoke', '@regression', '@api'], description: 'Which tag to run')
    choice(name: 'PROJECT', choices: ['ui-chromium', 'ui-firefox', 'api'], description: 'Browser / project')
    string(name: 'BASE_URL', defaultValue: 'https://www.saucedemo.com', description: 'Site under test')
  }
  triggers { cron('H 2 * * 1-5') }
  environment { CI = 'true' }
  options { timeout(time: 45, unit: 'MINUTES') }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
        sh 'npx playwright install --with-deps chromium firefox'
      }
    }
    stage('Type check') { steps { sh 'npm run typecheck' } }
    stage('Test') {
      steps {
        sh "BASE_URL=${params.BASE_URL} npx playwright test --project=${params.PROJECT} --grep '${params.SUITE}'"
      }
    }
  }
  post {
    always {
      junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
      publishHTML(target: [reportDir: 'playwright-report', reportFiles: 'index.html',
                           reportName: 'Playwright Report', keepAll: true, alwaysLinkToLastBuild: true])
      archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
    }
  }
}
