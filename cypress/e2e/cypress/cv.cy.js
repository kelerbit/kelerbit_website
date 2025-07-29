describe('CV Homepage', () => {
  it('should show project manager title and download button', () => {
    cy.visit('https://kelerbit.com/');
    cy.contains('Project Manager').should('exist');
    cy.contains('Download CV').should('exist');
  });
});