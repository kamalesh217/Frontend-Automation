Feature: Admin Login Functionality

  Scenario Outline: Admin Login with valid credentials - Run <run>
    Given Admin opens the admin login page
    When admin enters username "<username>"
    And admin enters password "<password>"
    Then admin clicks the login button and reaches dashboard

    Examples:
      | run | username | password |
      | 1   | admin    | admin123 |
      | 2   | admin    | admin123 |
