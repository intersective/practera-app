Feature: Registration to the app
  As a new user
  I should be able to register with correct link
  I should be able to logout

  Scenario: Try incorrect link
    Given I go to the incorrect registration link
    Then I should see registration link invalid pop up

  Scenario: Dismiss pop up
    When I click OK button of registration link invalid pop up
    Then I should be on the login page

  Scenario: Try correct link
    Given I go to the correct registration link
    Then I should be on the registration page

  Scenario: Register with not enough info
    When I click register button
    Then I should see "fill in your password" error in registration form

    Given I fill in short password in registration form
    When I click register button
    Then I should see "more than 8 characters" error in registration form

    Given I fill in correct password in registration form
    When I click register button
    Then I should see "fill in your password" error in registration form

    Given I fill in correct password in registration form
    Given I confirm incorrect password in registration form
    When I click register button
    Then I should see "passwords don't match" error in registration form

    Given I fill in correct password in registration form
    Given I confirm correct password in registration form
    When I click register button
    Then I should see "agree with terms and Conditions" error in registration form

  Scenario: Register with enough info
    Given I click terms & conditions checkbox
    When I click register button
    Then I should see registration success pop up
    When I click OK button of registration success pop up
    Then I should be on the home page

  Scenario: Go to settings page
    When I click the settings tab
    Then I should be on the settings page

  Scenario: Logout
    When I click logout button
    Then I should be on the login page
