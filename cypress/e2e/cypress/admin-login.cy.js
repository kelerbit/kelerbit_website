describe('Admin Login', () => {
  it('should login with correct credentials and show admin panel', () => {
    cy.visit('https://kelerbit.com/admin-login.html');

    cy.get('input[name="username"]').type('adminKelerbit');
    cy.get('input[name="password"]').type('32445');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/admin.html');
    cy.contains('Received Job Offers');
  });
});
