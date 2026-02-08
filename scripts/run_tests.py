import pytest
import sys
import os
from pathlib import Path

if __name__ == "__main__":
    print("--- Running BackpackInsight Tests ---")
    
    # Ensure we are in the project root (one level up from scripts/)
    current_dir = Path(__file__).resolve().parent
    project_root = current_dir.parent
    os.chdir(project_root)
    
    # Add project root to sys.path so tests can import modules
    sys.path.insert(0, str(project_root))
    
    # Run pytest programmatically
    # Arguments:
    # -v: verbose output
    # tests/: directory to search for tests
    exit_code = pytest.main(["-v", "tests/"])
    
    if exit_code == 0:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Some tests failed.")

    sys.exit(exit_code)
