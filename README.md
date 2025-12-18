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

## API

### `useDebouncedMemo<T>(factory, deps, delay?)`

#### Parameters

- **`factory`** `() => T` (required)
  - A function that returns the memoized value
  - This function will be called to compute the value whenever dependencies change

- **`deps`** `React.DependencyList` (required)
  - An array of dependencies that trigger recomputation
  - Works the same as the dependency array in `useMemo`

- **`delay`** `number` (optional, default: `300`)
  - Debounce delay in milliseconds
  - The computed value will be updated after this delay of inactivity

#### Returns

- **`T`**
  - The debounced memoized value
  - Initially returns the result of calling `factory()`
  - Updates to new computed values are debounced by the specified delay

## How It Works

1. The hook immediately computes an initial value using the `factory` function
2. When dependencies change, `useMemo` recalculates the value
3. Instead of immediately returning the new value, it starts a debounce timer
4. If dependencies change again before the timer expires, the timer resets
5. Once the timer expires, the component updates with the new value
6. Previous timers are always cleaned up to prevent memory leaks

## License

MIT
