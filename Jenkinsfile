pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '30'))
    }

    environment {
        // Jenkins doesn't set CI (GitHub Actions does), but
        // playwright.config.js keys retries/workers/forbidOnly off it and
        // globalSetup uses it for the Allure Environment label.
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

        // Lint before tests. Old violations are baselined in
        // eslint-suppressions.json, so this only trips on new ones.
        stage('Lint') {
            steps {
                bat 'npm run lint'
            }
        }

        // No --with-deps here (it installs Linux apt packages, irrelevant on
        // Windows) — just the browser binary.
        stage('Install Playwright browsers') {
            steps {
                bat 'npx playwright install chromium'
            }
        }

        stage('Run Playwright tests') {
            steps {
                // catchError lets the pipeline continue into post{} (report
                // generation/publishing) even when tests fail, instead of
                // aborting the build — same idea as the if: ${{ !cancelled() }}
                // guards in the GitHub Actions workflow.
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat 'npx playwright test --project=chromium --grep @regression'
                }
            }
        }
    }

    post {
        always {
            // Publish the Allure report inside Jenkins' UI, reading from the
            // same allure-results/ folder the allure-playwright reporter writes.
            allure commandline: 'allure', includeProperties: false, jdk: '', resultPolicy: 'LEAVE_AS_IS', results: [[path: 'allure-results']]

            // Keep Playwright's own HTML report too, as a downloadable build
            // artifact — same dual-report approach as CI.
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
    }
}