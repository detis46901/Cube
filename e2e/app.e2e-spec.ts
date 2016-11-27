import { CProjPage } from './app.po';

describe('c-proj App', function() {
  let page: CProjPage;

  beforeEach(() => {
    page = new CProjPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
