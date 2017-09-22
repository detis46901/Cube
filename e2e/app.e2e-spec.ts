import { CubePage } from './app.po';

describe('c-proj App', function() {
  let page: CubePage;

  beforeEach(() => {
    page = new CubePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
