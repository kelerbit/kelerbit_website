describe('Offer Form', () => {
  it('should fill and submit the form successfully', () => {
    cy.visit('https://kelerbit.com/offer.html');

    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="company"]').type('Test Corp');
    cy.get('input[name="position"]').type('Project Manager');
    cy.get('input[name="link"]').type('https://example.com/job');

    cy.get('button[type="submit"]').click();

    cy.contains('successfully sent').should('exist');
  });
});
