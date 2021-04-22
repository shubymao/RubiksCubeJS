import React, { Component, createRef } from 'react';
import Game from '../lib/game';
export class ThreeWrapper extends Component<{ game: Game }, {}> {
  private mount: React.RefObject<HTMLDivElement>;
  public constructor(props: any) {
    super(props);
    this.mount = createRef<HTMLDivElement>();
  }
  public componentDidMount() {
    this.props.game.start();
    window.addEventListener('resize', () => {
      this.updateoffset();
    });
    if (this.mount.current !== null) {
      this.mount.current.appendChild(this.props.game.renderer.domElement);
      this.props.game.updateoffset(this.mount.current.offsetLeft, this.mount.current.offsetTop);
    }
  }
  private updateoffset() {
    if (this.mount.current !== null) {
      this.props.game.updateoffset(this.mount.current.offsetLeft, this.mount.current.offsetTop);
    }
  }
  public componentWillUnmount() {
    this.props.game.stop();
  }
  public render() {
    return (
      <div
        style={{ width: this.props.game.width, height: this.props.game.width, position: 'relative' }}
        ref={this.mount}
      />
    );
  }
}
export default ThreeWrapper;
