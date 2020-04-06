Feature: Login/Logout the app
  As a user
  I should be able to login the app with correct credentials
  I should be able to logout

  Scenario: Before fill in email and password
    Given I go to the root page
    Then I should be on the login page
    Then I should not be able to click login button

  Scenario: Fill in incorrect email and password
    When I fill in incorrect account
    Then I should be able to click login button

  Scenario: Login with incorrect account
    When I click login button
    Then I should not be able to click login button
    Then I should see alert message

  Scenario: Dismiss the alert
    When I click OK button of alert
    Then I should be able to click login button

  Scenario: Remove email and password
    When I remove email and password
    Then I should not be able to click login button

  Scenario: Login with correct account
    When I fill in correct account
    Then I should be able to click login button
    When I click login button
    Then I should not be able to click login button
    Then I should be on the program switcher page

  Scenario: Choose first program
    When I choose first program
    Then I should be on the home page

  Scenario: Go to settings page
    When I click the settings tab
    Then I should be on the settings page

  Scenario: Logout
    When I click logout button
    Then I should be on the login page
