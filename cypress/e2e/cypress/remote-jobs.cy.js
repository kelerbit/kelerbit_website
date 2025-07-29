describe('Remote Jobs Page', () => {
  it('should load remote jobs list', () => {
    cy.visit('https://kelerbit.com/admin-remote-jobs.html');
    cy.contains('🌎 Remote Project Manager Jobs').should('exist');

    cy.get('ul li').should('have.length.at.least', 1);
  });
});
