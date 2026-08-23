"""
SwagIQ Setup Script
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read README
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text(encoding="utf-8") if (this_directory / "README.md").exists() else ""

setup(
    name="swagiq",
    version="1.0.0",
    author="Gio",
    author_email="zeroundici.ita@gmail.com",
    description="SwagIQ: Advanced Basketball Video Analytics & Scouting Platform",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/zeroEleven18/SwagIQ",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Topic :: Multimedia :: Video",
        "Topic :: Scientific/Engineering :: Image Recognition",
    ],
    python_requires=">=3.9",
    install_requires=[
        "opencv-python>=4.8.0",
        "numpy>=1.24.0",
        "scipy>=1.11.0",
        "scikit-image>=0.21.0",
        "yt-dlp>=2023.9.0",
        "roboflow>=1.1.0",
        "torch>=2.0.0",
        "torchvision>=0.15.0",
        "paddleocr>=2.7.0",
        "paddlepaddle>=2.5.0",
        "pandas>=2.0.0",
        "scikit-learn>=1.3.0",
        "reportlab>=4.0.0",
        "PyYAML>=6.0",
        "flask>=2.3.0",
        "requests>=2.31.0",
        "pillow>=10.0.0",
        "matplotlib>=3.7.0",
        "tqdm>=4.66.0",
        "pydantic>=2.3.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "black>=23.9.0",
            "flake8>=6.1.0",
            "mypy>=1.5.0",
        ],
        "database": [
            "sqlalchemy>=2.0.0",
            "psycopg2-binary>=2.9.0",
        ],
        "api": [
            "flask>=2.3.0",
            "flask-cors>=4.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "swagiq=main_pipeline:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)
