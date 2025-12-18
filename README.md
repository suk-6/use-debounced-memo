# use-debounced-memo

A React hook that combines `useMemo` with debouncing functionality. This hook is useful when you have expensive computations that you want to memoize and debounce to avoid frequent recalculations.

## Installation

```bash
npm install use-debounced-memo
```

or

```bash
yarn add use-debounced-memo
```

## Hook Description

`useDebouncedMemo` is a custom React hook that debounces a memoized value. It internally uses `useMemo` to compute a value based on dependencies, and then debounces updates to that value using a specified delay. This is particularly useful for:

- Expensive computations that depend on rapidly changing values
- Search filters or text input processing
- Data transformation that should only update after user stops typing
- Any scenario where you want to combine memoization with debouncing

## Usage Examples

### Basic Example

```tsx
import { useState } from 'react';
import { useDebouncedMemo } from 'use-debounced-memo';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce the expensive search filtering operation
  const filteredResults = useDebouncedMemo(
    () => {
      // Expensive filtering operation
      return performExpensiveSearch(searchTerm);
    },
    [searchTerm], // Dependencies
    500 // Delay in milliseconds
  );

  return (
    <div>
      <input 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      <div>{filteredResults}</div>
    </div>
  );
}
```

### Example with Complex Computation

```tsx
import { useState } from 'react';
import { useDebouncedMemo } from 'use-debounced-memo';

function DataVisualization() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});

  // Debounce expensive data processing
  const processedData = useDebouncedMemo(
    () => {
      // Complex data transformation
      return data
        .filter(item => matchesFilters(item, filters))
        .map(item => transformData(item))
        .sort((a, b) => compareItems(a, b));
    },
    [data, filters],
    300 // Update after 300ms of inactivity
  );

  return <Chart data={processedData} />;
}
```

### Example with Default Delay

```tsx
import { useState } from 'react';
import { useDebouncedMemo } from 'use-debounced-memo';

function Counter() {
  const [count, setCount] = useState(0);

  // Uses default 300ms delay
  const expensiveValue = useDebouncedMemo(
    () => {
      return performExpensiveCalculation(count);
    },
    [count]
  );

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Result: {expensiveValue}</p>
    </div>
  );
}
```

### Example with Lazy Option

```tsx
import { useState } from 'react';
import { useDebouncedMemo } from 'use-debounced-memo';

function SearchWithLazyExecution() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // With lazy: true, the expensive search only runs after user stops typing
  const searchResults = useDebouncedMemo(
    () => {
      console.log('Executing expensive search...'); // Only logs after debounce
      return performExpensiveSearch(searchTerm);
    },
    [searchTerm],
    { delay: 500, lazy: true } // Factory execution is also debounced
  );

  // Compare with lazy: false (default behavior)
  const eagerResults = useDebouncedMemo(
    () => {
      console.log('Executing search eagerly...'); // Logs immediately on change
      return performExpensiveSearch(searchTerm);
    },
    [searchTerm],
    { delay: 500, lazy: false } // Factory runs immediately, state update is debounced
  );

  return (
    <div>
      <input 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      <div>Lazy results: {searchResults}</div>
      <div>Eager results: {eagerResults}</div>
    </div>
  );
}
```

## API

### `useDebouncedMemo<T>(factory, deps, options?)`

#### Parameters

- **`factory`** `() => T` (required)
  - A function that returns the memoized value
  - This function will be called to compute the value whenever dependencies change

- **`deps`** `React.DependencyList` (required)
  - An array of dependencies that trigger recomputation
  - Works the same as the dependency array in `useMemo`

- **`options`** `number | { delay: number, lazy?: boolean }` (optional, default: `300`)
  - Can be either a number (for delay only) or an object with options
  - **As a number**: Specifies the debounce delay in milliseconds
  - **As an object**:
    - `delay`: Debounce delay in milliseconds
    - `lazy`: (optional, default: `false`) Controls when the factory function is executed
      - `false`: Factory runs immediately when dependencies change, but the state update is debounced (eager execution)
      - `true`: Both factory execution and state update are debounced (lazy execution)

#### Returns

- **`T`**
  - The debounced memoized value
  - Initially returns the result of calling `factory()`
  - Updates to new computed values are debounced by the specified delay

## How It Works

### Default Behavior (lazy: false)

1. The hook immediately computes an initial value using the `factory` function
2. When dependencies change, `useMemo` immediately recalculates the value
3. Instead of immediately returning the new value, it starts a debounce timer
4. If dependencies change again before the timer expires, the timer resets
5. Once the timer expires, the component updates with the new value
6. Previous timers are always cleaned up to prevent memory leaks

### Lazy Behavior (lazy: true)

1. The hook immediately computes an initial value using the `factory` function
2. When dependencies change, a debounce timer starts
3. If dependencies change again before the timer expires, the timer resets
4. Once the timer expires, the `factory` function is executed and the component updates with the new value
5. This can be more efficient when the `factory` function is expensive and you want to avoid running it on every dependency change
6. Previous timers are always cleaned up to prevent memory leaks

## License

MIT
