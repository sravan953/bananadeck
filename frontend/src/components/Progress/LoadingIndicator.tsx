import { motion } from 'framer-motion';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3 h-3 bg-blue-500 rounded-full"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.1,
            }}
          />
        ))}
      </motion.div>
      <motion.p
        className="mt-4 text-sm text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );
}