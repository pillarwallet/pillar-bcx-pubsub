@BlockChainExplorerPubSub
Feature: Get Tx Count
  
  @accepted @automation-complete
  Scenario: Register an acconunt and send a transaction
    Given An ethereum address
    When I register a new wallet
    And I connect to a node
    And I send a transaction
    Then Expect to find the transaction in the database