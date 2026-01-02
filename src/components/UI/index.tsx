import { WelcomeScreen } from './WelcomeScreen';
import { Header } from './Header';
import { LandmarkDetail } from './LandmarkDetail';
import { Compass } from './Compass';
import { Hint } from './Hint';

export function UI() {
  return (
    <>
      <WelcomeScreen />
      <Header />
      <LandmarkDetail />
      <Compass />
      <Hint />
    </>
  );
}
