Feature: Login/Logout the app
  As a user
  I should be able to login the app with correct credentials
  I should be able to logout

  Scenario: Before fill in email and password
    Given I go to the login page
    Then I should not be able to click login button

  Scenario: Fill in incorrect email and password
    When I fill in incorrect account
    Then I should be able to click login button

  Scenario: Login with incorrect account
    When I click login button
    Then I should not be able to click login button
    Then I should see alert message
