Feature: Employee Login Functionality

  Scenario Outline: Employee Login with valid credentials - Run <run>
    Given Employee opens the employee login page
    When employee enters username "<username>"
    And employee enters password "<password>"
    Then employee clicks the login button and reaches dashboard

    Examples:
      | run | username | password |
      | 1   | emp002   | pass123  |
      | 2   | emp003   | pass123  |
