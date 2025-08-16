/**
 * Neural Network Visualization
 * Creates an interactive neural network animation showing proper forward pass, backpropagation, and training
 */
const initializeNeuralNetwork = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('particles-js');

    // Replace particles-js content with our canvas
    container.innerHTML = '';
    container.appendChild(canvas);

    // Neural network configuration
    const config = {
        layers: [3, 4, 3, 1], // Input, Hidden1, Hidden2, Output
        neuronRadius: isMobileDevice() ? 14 : 20,
        connectionOpacity: 0.2,
        activeConnectionOpacity: 0.9,
        animationSpeed: 0.02,
        pulseSpeed: 0.03,
        trainingCycleDuration: 4000, // Time for one complete training cycle
        learningRate: 0.3,
    };

    let animationId;
    let neurons = [];
    let connections = [];
    let signals = [];
    let animationState = 'initializing'; // 'initializing', 'forward', 'backward', 'updating'
    let animationProgress = 0;
    let lastTime = 0;
    let trainingIteration = 0;
    let currentLoss = 1.0;
    let targetOutput = 0.8; // Target value for training
    let isTrainingComplete = false;

    // Fixed input values for consistency during training
    let inputValues = [0.7, 0.3, 0.9];

    // Neuron class
    class Neuron {
        constructor(x, y, layer, index) {
            this.x = x;
            this.y = y;
            this.layer = layer;
            this.index = index;
            this.activation = 0;
            this.targetActivation = 0;
            this.bias = (Math.random() - 0.5) * 1.0; // Random bias between -0.5 and 0.5
            this.radius = config.neuronRadius;
            this.pulse = 0;
            this.error = 0;
        }

        update() {
            // Immediate activation update for proper computation
            this.activation = this.targetActivation;

            // Pulse animation based on activation
            this.pulse += config.pulseSpeed;
            if (this.pulse > Math.PI * 2) this.pulse = 0;
        }

        draw(ctx) {
            const pulseScale = 1 + Math.sin(this.pulse) * 0.1 * this.activation;
            const currentRadius = this.radius * pulseScale;

            // Neuron body
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);

            // Color based on layer and activation level
            const intensity = Math.max(0.2, Math.min(1.0, this.activation));
            if (this.layer === 0) {
                ctx.fillStyle = `rgba(59, 130, 246, ${intensity})`; // Blue for input
            } else if (this.layer === config.layers.length - 1) {
                ctx.fillStyle = `rgba(34, 197, 94, ${intensity})`; // Green for output
            } else {
                ctx.fillStyle = `rgba(139, 92, 246, ${intensity})`; // Purple for hidden
            }
            ctx.fill();

            // Border
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1.0, intensity + 0.3)})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Error visualization during backprop
            if (animationState === 'backward' && this.error > 0) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRadius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(239, 68, 68, ${this.error})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Draw activation value
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = `${isMobileDevice() ? '10px' : '12px'} monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Show different values based on layer
            let displayText;
            if (this.layer === 0) {
                displayText = this.activation.toFixed(2); // Input values stay constant
            } else if (this.layer === config.layers.length - 1) {
                // Output layer shows loss instead of activation
                displayText = currentLoss.toFixed(3);
            } else {
                displayText = this.activation.toFixed(2); // Hidden layer activations
            }

            ctx.fillText(displayText, this.x, this.y);

            // Draw error value during backprop (but not for output layer)
            if (
                animationState === 'backward' &&
                this.error > 0 &&
                this.layer !== config.layers.length - 1
            ) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
                ctx.font = `${isMobileDevice() ? '8px' : '10px'} monospace`;
                const errorText = `ε:${this.error.toFixed(2)}`;
                ctx.fillText(errorText, this.x, this.y + currentRadius + 15);
            }
        }
    }

    // Connection class
    class Connection {
        constructor(from, to, weight = null) {
            this.from = from;
            this.to = to;
            this.weight = weight || (Math.random() - 0.5) * 2.0; // Random weight between -1.0 and 1.0
            this.originalWeight = this.weight;
            this.gradient = 0;
            this.isActive = false;
            this.opacity = config.connectionOpacity;
            this.targetOpacity = config.connectionOpacity;
        }

        update() {
            this.opacity += (this.targetOpacity - this.opacity) * 0.1;
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.moveTo(this.from.x, this.from.y);
            ctx.lineTo(this.to.x, this.to.y);

            const weightColor = this.weight > 0 ? '59, 130, 246' : '239, 68, 68';
            const alpha = this.opacity * Math.min(1.0, Math.abs(this.weight));
            ctx.strokeStyle = `rgba(${weightColor}, ${alpha})`;
            ctx.lineWidth = Math.abs(this.weight) * 2 + 0.5;
            ctx.stroke();
        }
    }

    // Signal class for flowing animations
    class Signal {
        constructor(from, to, type = 'forward', value = 1) {
            this.from = from;
            this.to = to;
            this.type = type; // 'forward' or 'backward'
            this.value = value;
            this.progress = 0;
            this.x = from.x;
            this.y = from.y;
            this.speed = 0.025;
        }

        update() {
            this.progress += this.speed;

            // Interpolate position
            this.x = this.from.x + (this.to.x - this.from.x) * this.progress;
            this.y = this.from.y + (this.to.y - this.from.y) * this.progress;

            return this.progress >= 1;
        }

        draw(ctx) {
            const size = 4;
            const glowSize = 2;

            // Outer glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, size + glowSize, 0, Math.PI * 2);
            if (this.type === 'forward') {
                ctx.fillStyle = `rgba(34, 197, 94, 0.3)`; // Green glow for forward
            } else {
                ctx.fillStyle = `rgba(239, 68, 68, 0.3)`; // Red glow for backward
            }
            ctx.fill();

            // Inner signal
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            if (this.type === 'forward') {
                ctx.fillStyle = `rgba(34, 197, 94, 0.9)`; // Green for forward
            } else {
                ctx.fillStyle = `rgba(239, 68, 68, 0.9)`; // Red for backward
            }
            ctx.fill();

            // Bright center
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }
    }

    // Activation functions
    function tanh(x) {
        return Math.tanh(x);
    }

    function tanhDerivative(x) {
        return 1 - x * x; // derivative of tanh(x) = 1 - tanh²(x)
    }

    function sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); // Clamp to prevent overflow
    }

    function meanSquaredError(predicted, target) {
        return 0.5 * Math.pow(predicted - target, 2);
    }

    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        setupNeuralNetwork();
    }

    function setupNeuralNetwork() {
        neurons = [];
        connections = [];

        const padding = 80;
        const layerSpacing = (canvas.width - padding * 2) / (config.layers.length - 1);

        // Create neurons
        config.layers.forEach((layerSize, layerIndex) => {
            const neuronSpacing = Math.max(
                40,
                (canvas.height - padding * 2) / Math.max(1, layerSize - 1)
            );
            const startY = (canvas.height - (layerSize - 1) * neuronSpacing) / 2;

            for (let i = 0; i < layerSize; i++) {
                const x = padding + layerIndex * layerSpacing;
                const y = layerSize === 1 ? canvas.height / 2 : startY + i * neuronSpacing;
                const neuron = new Neuron(x, y, layerIndex, i);
                neurons.push(neuron);
            }
        });

        // Create connections
        for (let layer = 0; layer < config.layers.length - 1; layer++) {
            const currentLayer = neurons.filter((n) => n.layer === layer);
            const nextLayer = neurons.filter((n) => n.layer === layer + 1);

            currentLayer.forEach((from) => {
                nextLayer.forEach((to) => {
                    const connection = new Connection(from, to);
                    connections.push(connection);
                });
            });
        }

        // Initialize input values
        const inputLayer = neurons.filter((n) => n.layer === 0);
        inputLayer.forEach((neuron, i) => {
            neuron.activation = inputValues[i];
            neuron.targetActivation = inputValues[i];
        });

        // Run initial forward pass to get proper starting values
        forwardPass();
    }

    function forwardPass() {
        // Process each layer sequentially
        for (let layer = 1; layer < config.layers.length; layer++) {
            const currentLayerNeurons = neurons.filter((n) => n.layer === layer);

            currentLayerNeurons.forEach((neuron) => {
                const incomingConnections = connections.filter((c) => c.to === neuron);

                // Compute weighted sum
                let weightedSum = neuron.bias;
                incomingConnections.forEach((connection) => {
                    weightedSum += connection.from.activation * connection.weight;
                });

                // Apply activation function and immediately update both target and actual
                if (layer === config.layers.length - 1) {
                    // Output layer - use sigmoid
                    neuron.activation = sigmoid(weightedSum);
                    neuron.targetActivation = neuron.activation;
                } else {
                    // Hidden layers - use tanh
                    neuron.activation = tanh(weightedSum);
                    neuron.targetActivation = neuron.activation;
                }
            });
        }

        // Calculate loss using actual activation
        const outputNeuron = neurons.find((n) => n.layer === config.layers.length - 1);
        currentLoss = meanSquaredError(outputNeuron.activation, targetOutput);

        // Auto-restart when loss gets very low (essentially solved)
        if (currentLoss < 0.001 && !isTrainingComplete) {
            isTrainingComplete = true;
            setTimeout(() => {
                restartTraining();
            }, 2000); // Wait 2 seconds before restarting to show the success
        }
    }

    function backwardPass() {
        // Start from output layer
        const outputNeuron = neurons.find((n) => n.layer === config.layers.length - 1);

        // Output layer error (derivative of MSE)
        outputNeuron.error = outputNeuron.activation - targetOutput;

        // Propagate error backwards
        for (let layer = config.layers.length - 2; layer >= 1; layer--) {
            const currentLayerNeurons = neurons.filter((n) => n.layer === layer);

            currentLayerNeurons.forEach((neuron) => {
                const outgoingConnections = connections.filter((c) => c.from === neuron);

                let errorSum = 0;
                outgoingConnections.forEach((connection) => {
                    errorSum += connection.to.error * connection.weight;
                });

                // Apply derivative of activation function
                neuron.error = errorSum * tanhDerivative(neuron.activation);
            });
        }
    }

    function updateWeights() {
        connections.forEach((connection, index) => {
            // Store old weight for comparison
            const oldWeight = connection.weight;

            // Calculate gradient
            const gradient = connection.from.activation * connection.to.error;

            // Update weight using gradient descent
            connection.weight -= config.learningRate * gradient;

            // Clamp weights to reasonable range
            connection.weight = Math.max(-2, Math.min(2, connection.weight));

            // Flash effect for weight update
            connection.targetOpacity = 1.0;
            setTimeout(() => {
                connection.targetOpacity = config.connectionOpacity;
            }, 200);
        });

        // Update biases
        neurons.forEach((neuron) => {
            if (neuron.layer > 0) {
                neuron.bias -= config.learningRate * neuron.error;
                neuron.bias = Math.max(-1, Math.min(1, neuron.bias));
            }
        });
    }

    function generateSignals(type) {
        if (type === 'forward') {
            // Generate signals layer by layer
            for (let layer = 0; layer < config.layers.length - 1; layer++) {
                const currentLayer = neurons.filter((n) => n.layer === layer);

                currentLayer.forEach((neuron) => {
                    const outgoingConnections = connections.filter((c) => c.from === neuron);
                    outgoingConnections.forEach((connection) => {
                        signals.push(
                            new Signal(neuron, connection.to, 'forward', neuron.activation)
                        );
                    });
                });
            }
        } else if (type === 'backward') {
            // Generate backward signals
            for (let layer = config.layers.length - 1; layer > 0; layer--) {
                const currentLayer = neurons.filter((n) => n.layer === layer);

                currentLayer.forEach((neuron) => {
                    const incomingConnections = connections.filter((c) => c.to === neuron);
                    incomingConnections.forEach((connection) => {
                        signals.push(new Signal(neuron, connection.from, 'backward', neuron.error));
                    });
                });
            }
        }
    }

    function animate(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update animation progress
        animationProgress += deltaTime;

        // State machine for training cycle
        const cycleDuration = config.trainingCycleDuration;
        const forwardDuration = cycleDuration * 0.3;
        const backwardDuration = cycleDuration * 0.3;
        const updateDuration = cycleDuration * 0.2;
        const pauseDuration = cycleDuration * 0.2;

        // Handle initialization state
        if (animationState === 'initializing') {
            animationState = 'forward';
            animationProgress = 0;
            signals = [];
            // forwardPass already called in setupNeuralNetwork
            generateSignals('forward');
        } else if (animationProgress < forwardDuration) {
            if (animationState !== 'forward') {
                animationState = 'forward';
                signals = [];
                forwardPass(); // This will immediately update neuron values
                generateSignals('forward');
            }
        } else if (animationProgress < forwardDuration + backwardDuration) {
            if (animationState !== 'backward') {
                animationState = 'backward';
                signals = [];
                backwardPass();
                generateSignals('backward');
            }
        } else if (animationProgress < forwardDuration + backwardDuration + updateDuration) {
            if (animationState !== 'updating') {
                animationState = 'updating';
                signals = [];
                updateWeights();
                trainingIteration++;
            }
        } else if (animationProgress >= cycleDuration) {
            // Reset for next cycle
            animationProgress = 0;
            // Don't set state here - let next frame handle it
        }

        // Update and draw connections
        connections.forEach((connection) => {
            connection.update();
            connection.draw(ctx);
        });

        // Update and draw neurons
        neurons.forEach((neuron) => {
            neuron.update();
            neuron.draw(ctx);
        });

        // Update and draw signals
        signals = signals.filter((signal) => {
            const completed = signal.update();
            signal.draw(ctx);
            return !completed;
        });

        // Draw UI elements
        drawUI();

        animationId = requestAnimationFrame(animate);
    }

    function drawUI() {
        // Draw layer labels at the top
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        const layerLabels = ['Input Layer', 'Hidden Layer 1', 'Hidden Layer 2'];
        const padding = 80;
        const layerSpacing = (canvas.width - padding * 2) / (config.layers.length - 1);

        layerLabels.forEach((label, index) => {
            const x = padding + index * layerSpacing;
            ctx.fillText(label, x, 20);
        });

        // Add specific label for the output neuron indicating it shows loss
        const outputNeuron = neurons.find((n) => n.layer === config.layers.length - 1);
        if (outputNeuron) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '10px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Loss', outputNeuron.x, outputNeuron.y + outputNeuron.radius + 20);
        }

        // Draw state indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'right';
        const stateText = isTrainingComplete
            ? '✅ Training Complete!'
            : animationState === 'initializing'
            ? 'Initializing...'
            : animationState === 'forward'
            ? 'Forward Pass →'
            : animationState === 'backward'
            ? '← Backpropagation'
            : animationState === 'updating'
            ? '⟲ Updating Weights'
            : 'Training...';

        // Color the text green when training is complete
        ctx.fillStyle = isTrainingComplete ? 'rgba(34, 197, 94, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(stateText, canvas.width - 20, 30);
    }

    function restartTraining() {
        // Reset training
        trainingIteration = 0;
        animationProgress = 0;
        animationState = 'initializing';
        signals = [];
        currentLoss = 1.0;
        isTrainingComplete = false;

        // Randomize input values for new training session
        inputValues = [Math.random(), Math.random(), Math.random()];
        targetOutput = 0.2 + Math.random() * 0.6; // Random target between 0.2 and 0.8

        // Reset neurons and connections
        setupNeuralNetwork();
    }

    // Initialize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Start animation
    lastTime = performance.now();
    animate(lastTime);

    // Cleanup function
    return () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    };
};
