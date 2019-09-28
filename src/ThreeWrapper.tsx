import React, { Component, createRef } from 'react';
export class ThreeWrapper extends Component<{ game: any }, {}> {
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
      if (this.props.game.fpsdom != null) this.mount.current.appendChild(this.props.game.fpsdom);
    }
  }
  private updateoffset() {
    if (this.mount.current !== null) {
      this.props.game.updateoffset(this.mount.current.offsetLeft, this.mount.current.offsetTop);
    }
  }
  public componentWillUnmount() {
    this.props.game.stop();
    if (this.mount.current !== null) this.mount.current.removeChild(this.props.game.renderer.domElement);
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
