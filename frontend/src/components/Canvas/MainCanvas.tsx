import { Tldraw, Editor, TLUiOverrides } from 'tldraw';
import 'tldraw/tldraw.css';
import { useCallback } from 'react';
import { useSlidesStore } from '../../store/slidesStore';
import { useProgressStore } from '../../store/progressStore';

export function MainCanvas() {
  const { slides, addSlide, selectSlide } = useSlidesStore();
  const { currentPhase } = useProgressStore();

  const handleMount = useCallback((editor: Editor) => {
    // Set up the canvas with custom configurations
    editor.updateInstanceState({ isReadonly: false });
    
    // Add event listeners for shape interactions
    editor.on('change', (change) => {
      // Handle shape changes
      if (change.source === 'user') {
        // Process user interactions
      }
    });

    // Set up canvas zones
    const viewport = editor.getViewportPageBounds();
    
    // Create visual zones (left: inputs, center: workspace, right: slides)
    // This is where we'll add custom shapes later
  }, []);

  const overrides: TLUiOverrides = {
    tools(editor, tools) {
      // Customize available tools
      return {
        ...tools,
        // We'll add custom tools here
      };
    },
    actions(editor, actions) {
      // Customize available actions
      return {
        ...actions,
        // We'll add custom actions here
      };
    },
  };

  return (
    <div className="w-full h-full relative">
      <Tldraw
        onMount={handleMount}
        overrides={overrides}
        hideUi={false}
        inferDarkMode
      >
        {/* Canvas content will be managed by tldraw */}
      </Tldraw>
      
      {/* Overlay UI elements */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-4 pointer-events-auto">
          <h2 className="text-lg font-semibold mb-2">BananaDeck</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Status: {currentPhase}
          </p>
        </div>
      </div>
    </div>
  );
}