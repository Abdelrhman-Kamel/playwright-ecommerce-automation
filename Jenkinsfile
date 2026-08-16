pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '30'))
    }

    environment {
        // Jenkins doesn't set CI automatically (GitHub Actions does), yet
        // playwright.config.js keys retries/workers/forbidOnly off it and
        // globalSetup labels the Allure report Environment on it.
        CI                         = 'true'
        BASE_URL                   = credentials('BASE_URL')
        LOGIN_USERNAME              = credentials('LOGIN_USERNAME')
        LOGIN_PASSWORD              = credentials('LOGIN_PASSWORD')
        SECURITY_TEST_EMAIL         = credentials('SECURITY_TEST_EMAIL')
        SECURITY_TEST_PASSWORD      = credentials('SECURITY_TEST_PASSWORD')
        SECONDARY_ACCOUNT_EMAIL     = credentials('SECONDARY_ACCOUNT_EMAIL')
        SECONDARY_ACCOUNT_PASSWORD  = credentials('SECONDARY_ACCOUNT_PASSWORD')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        // No --with-deps here (that flag installs Linux apt packages and
        // isn't relevant on Windows) — just the browser binary itself.
        stage('Install Playwright browsers') {
            steps {
                bat 'npx playwright install chromium'
            }
        }

        stage('Run Playwright tests') {
            steps {
                // catchError lets the pipeline continue into post{} (report
                // generation/publishing) even if tests fail, instead of
                // aborting the whole build — same reasoning as the
                // if: ${{ !cancelled() }} guards in the GitHub Actions workflow.
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat 'npx playwright test --project=chromium --grep @regression'
                }
            }
        }
    }

    post {
        always {
            // Publishes the Allure report natively inside Jenkins' UI,
            // reading from the same allure-results/ folder the
            // allure-playwright reporter already writes to.
            allure includeProperties: false, results: [[path: 'allure-results']]

            // Keep Playwright's own HTML report too, downloadable as a
            // build artifact — same dual-report approach as CI.
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
    }
}