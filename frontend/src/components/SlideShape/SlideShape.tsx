import {
  BaseBoxShapeUtil,
  HTMLContainer,
  TLBaseShape,
  Editor,
  ShapeProps,
  TLDefaultColorStyle,
} from 'tldraw';

export type SlideShape = TLBaseShape<
  'slide',
  {
    w: number;
    h: number;
    title: string;
    content: string[];
    imageUrl?: string;
    infographicSuggestion?: string;
    color: TLDefaultColorStyle;
  }
>;

export class SlideShapeUtil extends BaseBoxShapeUtil<SlideShape> {
  static override type = 'slide' as const;

  getDefaultProps(): SlideShape['props'] {
    return {
      w: 800,
      h: 450,
      title: 'Slide Title',
      content: [],
      color: 'black',
    };
  }

  override canEdit = () => false;

  component(shape: SlideShape) {
    const { title, content, imageUrl, infographicSuggestion } = shape.props;

    return (
      <HTMLContainer id={shape.id}>
        <div
          className="slide-shape"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, sans-serif',
            color: '#f1f5f9',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <>
              <div
                style={{
                  padding: '24px',
                  borderBottom: '1px solid #334155',
                }}
              >
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  {title}
                </h2>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {content.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      fontSize: '16px',
                      lineHeight: 1.6,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <span style={{ color: '#60a5fa' }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
                {infographicSuggestion && (
                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '12px',
                      backgroundColor: '#334155',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontStyle: 'italic',
                      color: '#94a3b8',
                    }}
                  >
                    💡 {infographicSuggestion}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </HTMLContainer>
    );
  }

  override indicator(shape: SlideShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}