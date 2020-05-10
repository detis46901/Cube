import { CubePage } from './app.po';

describe('cube App', function() {
  let page: CubePage;

  beforeEach(() => {
    page = new CubePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    //expect(page.getParagraphText()).toEqual();
  });
});
