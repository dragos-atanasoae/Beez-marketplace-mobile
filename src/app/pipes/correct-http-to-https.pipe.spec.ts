import { CorrectHttpToHttpsPipe } from './correct-http-to-https.pipe';

describe('CorrectHttpToHttpsPipe', () => {
  it('create an instance', () => {
    const pipe = new CorrectHttpToHttpsPipe();
    expect(pipe).toBeTruthy();
  });
});
